exports.createCliente = async (req, res) => {
    try {
        const cliente = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            identificacion: req.body.identificacion,
            email: req.body.email,
            telefono: req.body.telefono,
            direccion: req.body.direccion
        };

        // Cambia esta línea:
        const result = await Cliente.create(cliente); // Usa create() en lugar de createCliente()
        
        res.status(201).json({
            message: "Cliente creado exitosamente",
            cliente: result
        });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
}