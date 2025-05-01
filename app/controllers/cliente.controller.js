const { ConnectionAcquireTimeoutError } = require('sequelize');
const db = require('../config/db.config.js');
const Cliente = db.Cliente;

exports.createCliente = async (req, res) => {
    // Validación básica de campos requeridos
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
            nombre: req.body.nombre.substring(0, 20), // Aseguramos no exceder el límite
            apellido: req.body.apellido.substring(0, 20),
            identificacion: req.body.identificacion,
            email: req.body.email.substring(0, 50),
            telefono: req.body.telefono.substring(0, 15),
            direccion: req.body.direccion?.substring(0, 100) // El ?. es por si es undefined
        };

        const nuevoCliente = await Cliente.create(cliente);
        
        return res.status(201).json({
            success: true,
            message: "Cliente creado exitosamente",
            data: nuevoCliente
        });
    } catch (error) {
        console.error("Error en createCliente:", error);
        
        // Manejo específico de errores de Sequelize
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

exports.BuscarCliente = async (req, res) => {
    const { identificacion } = req.params;

    if (!identificacion) {
        return res.status(400).json({
            success: false,
            message: "El parámetro 'identificacion' es requerido"
        });
    }

    try {
        const cliente = await Cliente.findOne({
            where: { identificacion: identificacion }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cliente encontrado",
            data: cliente
        });
    } catch (error) {
        console.error("Error en getClienteByIdentificacion:", error);
        
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error'
        });
    }
};

exports.actuCliente = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "El parámetro 'id' es requerido"
        });
    }

    try {
        // Verificar si el cliente existe
        const clienteExistente = await Cliente.findByPk(id);
        
        if (!clienteExistente) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        // Preparar los datos a actualizar
        const datosActualizados = {
            nombre: req.body.nombre?.substring(0, 20),
            apellido: req.body.apellido?.substring(0, 20),
            identificacion: req.body.identificacion,
            email: req.body.email?.substring(0, 50),
            telefono: req.body.telefono?.substring(0, 15),
            direccion: req.body.direccion?.substring(0, 100)
        };

        // Filtrar campos undefined para no actualizar campos no proporcionados
        Object.keys(datosActualizados).forEach(key => {
            if (datosActualizados[key] === undefined) {
                delete datosActualizados[key];
            }
        });

        // Actualizar el cliente
        await Cliente.update(datosActualizados, {
            where: { id: id }
        });

        // Obtener el cliente actualizado para devolverlo en la respuesta
        const clienteActualizado = await Cliente.findByPk(id);

        return res.status(200).json({
            success: true,
            message: "Cliente actualizado exitosamente",
            data: clienteActualizado
        });
    } catch (error) {
        console.error("Error en updateCliente:", error);
        
        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Error de duplicación",
                error: "La nueva identificación o email ya existen"
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