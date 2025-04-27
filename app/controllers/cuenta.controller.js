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

exports.suspenderCuenta = async (req, res) => {
    try {
        const { numero_cuenta } = req.body;

        console.log("Recibido en endpoint:", numero_cuenta);

        // Validar que se proporcionó el número de cuenta
        if (!numero_cuenta) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta es requerido'
            });
        }

        // Buscar la cuenta
        const cuenta = await Cuenta.findOne({
            where: { numero_cuenta }
        });

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Verificar si la cuenta ya está suspendida
        if (cuenta.estado === 'Suspendida') {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está suspendida'
            });
        }

        // Actualizar el estado de la cuenta
        await cuenta.update({ estado: 'Suspendida' });

        return res.status(200).json({
            success: true,
            message: 'Cuenta suspendida exitosamente',
            data: cuenta
        });
    } catch (error) {
        console.error('Error al suspender la cuenta: ', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
};

exports.obtenerDetalleCuenta = async (req, res) => {
    try {
        const { numero_cuenta } = req.body; // Cambiado de req.query a req.body

        // Validar que se proporcionó el número de cuenta
        if (!numero_cuenta) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta es requerido'
            });
        }

        // Buscar la cuenta con la información del cliente asociado
        const cuenta = await Cuenta.findOne({
            where: { numero_cuenta },
            include: [{
                model: Cliente,
                attributes: ['cliente_id', 'nombre', 'apellido', 'identificacion','email','telefono','direccion']
            }]
        });

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Detalle de cuenta obtenido exitosamente',
            data: cuenta
        });
    } catch (error) {
        console.error('Error al obtener el detalle de la cuenta: ', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
};