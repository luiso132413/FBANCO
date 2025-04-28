const db = require('../config/db.config.js');
const Cuenta = require('../models/cuenta.model.js');
const Transaccion = require('../models/transaccion.model.js');
const { validationResult } = require('express-validator');

exports.Depositar = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { cuenta_id, monto, descripcion, cuenta_asociada } = req.body;

        // Validar que el monto sea positivo
        if(parseFloat(monto) <= 0) {
            return res.status(400).json({ error: 'El monto debe ser positivo' });
        }

        const cuenta = await Cuenta.findOne({ where: { cuenta_id } });
        if(!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        if(cuenta.estado !== 'Activa') {
            return res.status(400).json({ error: 'La cuenta no está Activa' });
        }

        const transaccion = await Transaccion.create({
            cuenta_id: cuenta.cuenta_id,
            tipo_tra: 'deposito',
            monto: parseFloat(monto),
            descripcion: descripcion || 'Depósito en efectivo',
            cuenta_asociada: cuenta_asociada || null,
            // fecha_tra no se incluye porque tiene defaultValue NOW en el modelo
        });

        // Actualizar balance de la cuenta
        cuenta.balance = parseFloat(cuenta.balance) + parseFloat(monto);
        await cuenta.save();

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
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { cuenta_id, monto, descripcion } = req.body;

        // Validar que el monto sea positivo
        if(parseFloat(monto) <= 0) {
            return res.status(400).json({ error: 'El monto debe ser positivo' });
        }

        const cuenta = await Cuenta.findOne({ where: { cuenta_id } });
        if(!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        if(cuenta.estado !== 'Activa') {
            return res.status(400).json({ error: 'La cuenta no está Activa' });
        }

        if(parseFloat(cuenta.balance) < parseFloat(monto)) {
            return res.status(400).json({ error: 'Fondos insuficientes' });
        }

        const transaccion = await Transaccion.create({
            cuenta_id: cuenta.cuenta_id,
            tipo_tra: 'retiro',
            monto: parseFloat(monto),
            descripcion: descripcion || 'Retiro en efectivo',
            // cuenta_asociada no es obligatoria para retiros
            // fecha_tra tiene defaultValue NOW en el modelo
        });

        // Actualizar balance de la cuenta
        cuenta.balance = parseFloat(cuenta.balance) - parseFloat(monto);
        await cuenta.save();

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

    } catch (error) {
        console.error('Error en Retirar:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message 
        });
    }
};