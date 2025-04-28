const db = require('../config/db.config.js');
const Cuenta = require('../models/cuenta.model.js');
const Transaccion = require('../models/transaccion.model.js');
const { validationResult } = require('express-validator');

exports.Depositar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { cuenta_id, monto, descripcion, cuenta_asociada } = req.body;
        const montoParsed = parseFloat(monto);

        if (isNaN(montoParsed) || montoParsed <= 0) {
            return res.status(400).json({ error: 'El monto debe ser un número positivo' });
        }

        const cuenta = await Cuenta.findOne({ where: { cuenta_id } });
        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        if (cuenta.estado !== 'Activa') {
            return res.status(400).json({ error: 'La cuenta no está activa' });
        }

        // Usar transacción de Sequelize
        await db.transaction(async (t) => {
            const transaccion = await Transaccion.create({
                cuenta_id: cuenta.cuenta_id,
                tipo_tra: 'deposito',
                monto: montoParsed,
                descripcion: descripcion || 'Depósito en efectivo',
                cuenta_asociada: cuenta_asociada || null
            }, { transaction: t });

            cuenta.balance += montoParsed;
            await cuenta.save({ transaction: t });

            res.status(201).json({
                message: 'Depósito realizado exitosamente',
                transaccion: {
                    transa_id: transaccion.transa_id,
                    cuenta_id: transaccion.cuenta_id,
                    tipo_tra: transaccion.tipo_tra,
                    monto: transaccion.monto,
                    descripcion: transaccion.descripcion,
                    cuenta_asociada: transaccion.cuenta_asociada,
                    fecha_tra: transaccion.fecha_tra
                },
                nuevo_balance: cuenta.balance
            });
        });

    } catch (error) {
        console.error('Error en Depositar:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

exports.Retirar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { cuenta_id, monto, descripcion } = req.body;
        const montoParsed = parseFloat(monto);

        if (isNaN(montoParsed) || montoParsed <= 0) {
            return res.status(400).json({ error: 'El monto debe ser un número positivo' });
        }

        const cuenta = await Cuenta.findOne({ where: { cuenta_id } });
        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        if (cuenta.estado !== 'Activa') {
            return res.status(400).json({ error: 'La cuenta no está activa' });
        }

        if (cuenta.balance < montoParsed) {
            return res.status(400).json({ error: 'Fondos insuficientes' });
        }

        // Usar transacción de Sequelize
        await db.transaction(async (t) => {
            const transaccion = await Transaccion.create({
                cuenta_id: cuenta.cuenta_id,
                tipo_tra: 'retiro',
                monto: montoParsed,
                descripcion: descripcion || 'Retiro en efectivo'
            }, { transaction: t });

            cuenta.balance -= montoParsed;
            await cuenta.save({ transaction: t });

            res.status(201).json({
                message: 'Retiro realizado exitosamente',
                transaccion: {
                    transa_id: transaccion.transa_id,
                    cuenta_id: transaccion.cuenta_id,
                    tipo_tra: transaccion.tipo_tra,
                    monto: transaccion.monto,
                    descripcion: transaccion.descripcion,
                    fecha_tra: transaccion.fecha_tra
                },
                nuevo_balance: cuenta.balance
            });
        });

    } catch (error) {
        console.error('Error en Retirar:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};
