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
// Actualizar un cliente con identificación en el body
exports.actualizarCliente = async (req, res) => {
    const { identificacion, ...datosActualizar } = req.body;

    // Validación de la identificación
    if (!identificacion && identificacion !== 0) {
        return res.status(400).json({
            success: false,
            message: "El campo 'identificacion' es requerido en el cuerpo de la petición"
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
        // Verificar si el cliente existe
        const clienteExistente = await Cliente.findOne({ where: { identificacion: idNumber } });
        
        if (!clienteExistente) {
            return res.status(404).json({
                success: false,
                message: `Cliente con identificación ${idNumber} no encontrado`
            });
        }

        // Campos permitidos para actualización (excluyendo identificacion)
        const camposPermitidos = ['nombre', 'apellido', 'email', 'telefono', 'direccion'];
        const datosActualizados = {};
        
        // Filtrar y validar los campos
        camposPermitidos.forEach(campo => {
            if (datosActualizar[campo] !== undefined) {
                datosActualizados[campo] = datosActualizar[campo]?.substring(0, 
                    campo === 'nombre' || campo === 'apellido' ? 20 :
                    campo === 'email' ? 50 :
                    campo === 'telefono' ? 15 : 100);
            }
        });

        // Validar que haya datos para actualizar
        if (Object.keys(datosActualizados).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos válidos para actualizar"
            });
        }

        // Actualizar el cliente
        await Cliente.update(datosActualizados, {
            where: { identificacion: idNumber }
        });

        // Obtener el cliente actualizado
        const clienteActualizado = await Cliente.findOne({ where: { identificacion: idNumber } });

        return res.status(200).json({
            success: true,
            message: "Cliente actualizado exitosamente",
            data: clienteActualizado
        });

    } catch (error) {
        console.error("Error en actualizarCliente:", error);

        // Manejo de errores específicos
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Error de duplicación",
                error: "El email ya está en uso por otro cliente"
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación de datos",
                errors: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar cliente",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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