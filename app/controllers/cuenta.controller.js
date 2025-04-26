const db = require('../config/db.config.js');
const Cuenta = db.Cuenta;
const Cliente = db.Cliente;
const { validationResult } = require('express-validator');

exports.crearCuenta = async (req, res) => {
    // Validación de campos obligatorios
    const requiredFields = ['cliente_id', 'tipo_cuenta'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `El campo ${field} es requerido`
            });
        }
    }

    // Validaciones personalizadas (si estás usando express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    try {
        const { cliente_id, tipo_cuenta } = req.body;

        // Verificamos que el cliente exista
        const cliente = await Cliente.findByPk(cliente_id);
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Generación del número de cuenta (se asume que este método existe en el modelo)
        const numero_cuenta = await Cuenta.generarNumeroCuenta();

        const cuenta = await Cuenta.create({
            cliente_id,
            numero_cuenta,
            tipo_cuenta,
            balance: 0.00,
            estado: 'Activa'
        });

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: cuenta
        });
    } catch (error) {
        console.error('Error al crear la cuenta: ', error);

        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Error de duplicación',
                error: 'El número de cuenta ya existe'
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
