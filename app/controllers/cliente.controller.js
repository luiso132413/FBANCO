const { ConnectionAcquireTimeoutError } = require('sequelize');
const db = require('../config/db.config.js');
const Cliente = db.Cliente;

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
    const requiredFields = ['nombre', 'apellido', 'identificacion', 'email', 'telefono'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `El campo ${field} es requerido`
            });
        }
    }

    try {
        const cliente = {
            nombre: req.body.nombre.substring(0, 20),
            apellido: req.body.apellido.substring(0, 20),
            identificacion: req.body.identificacion,
            email: req.body.email.substring(0, 50),
            telefono: req.body.telefono.substring(0, 15),
            direccion: req.body.direccion?.substring(0, 100)
        };

        const nuevoCliente = await Cliente.create(cliente);

        return res.status(201).json({
            success: true,
            message: "Cliente creado exitosamente",
            data: nuevoCliente
        });
    } catch (error) {
        console.error("Error en createCliente:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Error de duplicación",
                error: "La identificación o email ya existen"
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
};

// Buscar cliente por identificación usando GET con body JSON
exports.buscarCliente = async (req, res) => {
    // Verificar si el body parser está configurado para GET
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Debe enviar un JSON con el campo 'identificacion' en el cuerpo de la petición"
        });
    }

    const { identificacion } = req.body;

    // Validaciones
    if (!identificacion && identificacion !== 0) {
        return res.status(400).json({
            success: false,
            message: "El campo 'identificacion' es requerido en el cuerpo de la petición (JSON)"
        });
    }

    if (isNaN(identificacion)) {
        return res.status(400).json({
            success: false,
            message: "La identificación debe ser un número válido"
        });
    }

    const idNumber = parseInt(identificacion);

    try {
        const cliente = await Cliente.findOne({ 
            where: { identificacion: idNumber },
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: `Cliente no encontrado con identificación: ${idNumber}`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cliente encontrado exitosamente",
            data: cliente
        });

    } catch (error) {
        console.error("Error en buscarCliente:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al buscar cliente",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar un cliente por identificación
exports.updateCliente = async (req, res) => {
    const { identificacion } = req.params;

    if (!identificacion) {
        return res.status(400).json({
            success: false,
            message: "Se requiere la identificación del cliente para actualizar"
        });
    }

    try {
        // Buscar el cliente existente por identificación
        const clienteExistente = await Cliente.findOne({ where: { identificacion } });
        if (!clienteExistente) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        // Preparar los datos para actualizar
        const datosActualizados = {
            nombre: req.body.nombre?.substring(0, 20),
            apellido: req.body.apellido?.substring(0, 20),
            email: req.body.email?.substring(0, 50),
            telefono: req.body.telefono?.substring(0, 15),
            direccion: req.body.direccion?.substring(0, 100)
        };

        // No permitir actualización de identificación (clave única)
        if (req.body.identificacion && req.body.identificacion !== identificacion) {
            return res.status(400).json({
                success: false,
                message: "No se puede modificar la identificación del cliente"
            });
        }

        // Filtrar campos undefined (mantener valores existentes si no se proporcionan)
        for (const key in datosActualizados) {
            if (datosActualizados[key] === undefined) {
                datosActualizados[key] = clienteExistente[key];
            }
        }

        // Validar campos requeridos
        const requiredFields = ['nombre', 'apellido', 'email', 'telefono'];
        for (const field of requiredFields) {
            if (!datosActualizados[field]) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${field} es requerido`
                });
            }
        }

        // Actualizar el cliente
        await clienteExistente.update(datosActualizados);

        return res.status(200).json({
            success: true,
            message: "Cliente actualizado exitosamente",
            data: clienteExistente
        });
    } catch (error) {
        console.error("Error en updateCliente:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Error de duplicación",
                error: "El email ya existe"
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
}; 

exports.getAllClientes = (req, res) => {
    Cliente.findAll().then(cliente => {
        res.status(200).json({
            message: "Clientes obtenidos exitosamente",
            cliente: cliente,
        });
    }).catch(error =>{
        console.log(error);
        res.status(500).json({
            message: "Error!",
            error: error,
        });
    });
};