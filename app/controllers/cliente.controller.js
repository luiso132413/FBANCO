const db = require('../config/db.config.js');
const Cliente = db.Cliente;
const { validationResult } = require('express-validator');

exports.crearCliente = async (req, res) => {
    const requireFields = ['nombre', 'apellido', 'identificacion', 'email', 'telefono', 'direccion'];
    for (const field of requireFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `El campo ${field} es requerido`
            });
        }
    }

    try {
        const { nombre, apellido, identificacion, email, telefono, direccion } = req.body;
        const cliente = await Cliente.create({
            nombre, 
            apellido, 
            identificacion,
            email,
            telefono, 
            direccion
        });

        return res.status(201).json({
            success: true, 
            message: 'Cliente creado Exitosamente', 
            data: {
                cliente: {
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    identificacion: cliente.identificacion,
                    email: cliente.email,
                    telefono: cliente.telefono,
                    direccion: cliente.direccion
                }
            }
        });
    } catch (error) {
        console.error('Error detallado al crear cuenta:', {
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
}