exports.crearCliente = async (req, res) => {
  const requireFields = ['nombre', 'apellido', 'identificacion', 'email', 'telefono'];
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
    
    // Verificar si el cliente ya existe
    const clienteExistente = await Cliente.findOne({
      where: { identificacion }
    });
    
    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con esta identificación'
      });
    }

    const cliente = await Cliente.create({
      identificacion,
      nombre, 
      apellido, 
      email,
      telefono, 
      direccion
    });

    return res.status(201).json({
      success: true, 
      message: 'Cliente creado exitosamente', 
      data: cliente
    });
    
  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'La identificación ya está registrada'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error al crear el cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}