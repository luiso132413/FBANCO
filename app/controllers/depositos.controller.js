const db = require('../config/db.config.js');
const Cuenta = db.Cuenta;
const Transaccion = db.Transaccion;
const { validationResult } = require('express-validator');

exports.Depositar = async (req, res) => {
    // Validación de campos obligatorios
    const requiredFields = ['monto'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `El campo ${field} es requerido`
            });
        }
    }

    // Validaciones de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    try {
        const { cuentaId } = req.params;
        const { monto, descripcion, cuenta_asociada } = req.body;

        // Validar que el monto sea positivo
        if (parseFloat(monto) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser un valor positivo'
            });
        }

        // Buscar la cuenta
        const cuenta = await Cuenta.findByPk(cuentaId);
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Verificar estado de la cuenta
        if (cuenta.estado !== 'Activa') {
            return res.status(400).json({
                success: false,
                message: 'No se puede depositar en una cuenta no activa'
            });
        }

        // Crear la transacción
        const transaccion = await Transaccion.create({
            cuenta_id: cuenta.cuenta_id,
            tipo_tra: 'deposito',
            monto: parseFloat(monto),
            descripcion: descripcion || 'Depósito en efectivo',
            cuenta_asociada: cuenta_asociada || null
        });

        // Actualizar el balance de la cuenta
        cuenta.balance = parseFloat(cuenta.balance) + parseFloat(monto);
        await cuenta.save();

        return res.status(201).json({
            success: true,
            message: 'Depósito realizado exitosamente',
            data: {
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
            }
        });

    } catch (error) {
        console.error('Error en Depositar:', error);

        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Error de duplicación',
                error: error.message
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
};

exports.Retirar = async (req, res) => {
    // Validación de campos obligatorios
    const requiredFields = ['monto'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `El campo ${field} es requerido`
            });
        }
    }

    // Validaciones de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    try {
        const { cuentaId } = req.params;
        const { monto, descripcion } = req.body;

        // Validar que el monto sea positivo
        if (parseFloat(monto) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser un valor positivo'
            });
        }

        // Buscar la cuenta
        const cuenta = await Cuenta.findByPk(cuentaId);
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Verificar estado de la cuenta
        if (cuenta.estado !== 'Activa') {
            return res.status(400).json({
                success: false,
                message: 'No se puede retirar de una cuenta no activa'
            });
        }

        // Verificar fondos suficientes
        if (parseFloat(cuenta.balance) < parseFloat(monto)) {
            return res.status(400).json({
                success: false,
                message: 'Fondos insuficientes para realizar el retiro'
            });
        }

        // Crear la transacción
        const transaccion = await Transaccion.create({
            cuenta_id: cuenta.cuenta_id,
            tipo_tra: 'retiro',
            monto: parseFloat(monto),
            descripcion: descripcion || 'Retiro en efectivo'
        });

        // Actualizar el balance de la cuenta
        cuenta.balance = parseFloat(cuenta.balance) - parseFloat(monto);
        await cuenta.save();

        return res.status(201).json({
            success: true,
            message: 'Retiro realizado exitosamente',
            data: {
                transaccion: {
                    transa_id: transaccion.transa_id,
                    cuenta_id: transaccion.cuenta_id,
                    tipo_tra: transaccion.tipo_tra,
                    monto: transaccion.monto,
                    descripcion: transaccion.descripcion,
                    fecha_tra: transaccion.fecha_tra
                },
                nuevo_balance: cuenta.balance
            }
        });

    } catch (error) {
        console.error('Error en Retirar:', error);

        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Error de duplicación',
                error: error.message
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
};