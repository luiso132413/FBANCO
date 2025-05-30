const db = require('../config/db.config.js');
const Cuenta = db.Cuenta;
const Cliente = db.Cliente;
const { validationResult } = require('express-validator');

exports.crearCuenta = async (req, res) => {
    const requiredFields = ['identificacion', 'tipo_cuenta'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `El campo ${field} es requerido`
            });
        }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    try {
        const { identificacion, tipo_cuenta } = req.body;

        const identificacionNumero = Number(identificacion);
        if (isNaN(identificacionNumero)) {
            return res.status(400).json({
                success: false,
                message: 'La identificación debe ser un número válido'
            });
        }

        const cliente = await Cliente.findOne({
            where: { identificacion: identificacionNumero }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado',
                details: `No se encontró cliente con identificación: ${identificacionNumero}`
            });
        }

        const numero_cuenta = await Cuenta.generarNumeroCuenta();

        const cuenta = await Cuenta.create({
            identificacion: identificacionNumero,
            numero_cuenta,
            tipo_cuenta,
            balance: 0.00,
            estado: 'Activa'
        });

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: {
                cuenta,
                cliente: {
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    identificacion: cliente.identificacion
                }
            }
        });

    } catch (error) {
        console.error('Error detallado al crear cuenta:', {
            message: error.message,
            stack: error.stack,
            ...(error.errors && { validationErrors: error.errors.map(e => e.message) })
        });

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Error de duplicación',
                details: error.errors.map(e => e.message)
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación de datos',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
        });
    }
};

exports.suspenderCuenta = async (req, res) => {
    try {
        const { numero_cuenta } = req.body;

        console.log("Recibido en endpoint:", numero_cuenta);

        if (!numero_cuenta) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta es requerido'
            });
        }

        const cuenta = await Cuenta.findOne({
            where: { numero_cuenta }
        });

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (cuenta.estado === 'Suspendida') {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está suspendida'
            });
        }

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

exports.activarCuenta = async (req, res) => {
    try {
        const { numero_cuenta } = req.body;

        if (!numero_cuenta) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta es requerido'
            });
        }

        const cuenta = await Cuenta.findOne({
            where: { numero_cuenta }
        });

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (cuenta.estado === 'Activa') {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está activa'
            });
        }

        await cuenta.update({ estado: 'Activa' });

        return res.status(200).json({
            success: true,
            message: 'Cuenta activada exitosamente',
            data: cuenta
        });
    } catch (error) {
        console.error('Error al activar la cuenta: ', {
            message: error.message,
            stack: error.stack,
            ...(error.errors && { validationErrors: error.errors.map(e => e.message) })
        });

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
        });
    }
};

exports.obtenerDetalleCuenta = async (req, res) => {
    try {
        const { numero_cuenta } = req.body; 

        if (!numero_cuenta) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta es requerido'
            });
        }

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