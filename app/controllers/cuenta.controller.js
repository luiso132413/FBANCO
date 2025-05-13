const db = require('../config/db.config.js');
const Cuenta = db.Cuenta;
const Cliente = db.Cliente;
const { validationResult } = require('express-validator');

exports.crearCuenta = async (req, res) => {
    // Validación de campos obligatorios
    const requiredFields = ['identificacion', 'tipo_cuenta'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `El campo ${field} es requerido`
            });
        }
    }

    // Validaciones personalizadas
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

        // Convertir identificación a número si es necesario
        const identificacionNumero = Number(identificacion);
        if (isNaN(identificacionNumero)) {
            return res.status(400).json({
                success: false,
                message: 'La identificación debe ser un número válido'
            });
        }

        // Verificar que el cliente exista usando findOne (más confiable que findByPk)
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

        // Generación del número de cuenta
        const numero_cuenta = await Cuenta.generarNumeroCuenta();

        // Crear la cuenta asegurando los tipos de datos
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

        // Manejo específico de errores de Sequelize
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

exports.activarCuenta = async (req, res) => {
    try {
        const { numero_cuenta } = req.body;

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

        // Verificar si la cuenta ya está activa
        if (cuenta.estado === 'Activa') {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está activa'
            });
        }

        // Actualizar el estado de la cuenta
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