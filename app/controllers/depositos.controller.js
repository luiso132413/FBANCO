const db = require('../config/db.config.js');
const Transaccion = db.Transaccion;
const Cuenta = db.Cuenta;
const { validationResult } = require('express-validator');

exports.Depositos = async (req, res) => {
  //Validacion de campos obligatorios
  const requiredFields = ['monto'];
  for (const field of requiredFields) {
    if (!req.body[field]){
      return res.status(400).json({
        success: false,
        message: `El campo ${field} es requerido`
      });
    }
  }

  // Validaciones de express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
      });
  }

  try{
    const {cuenta_id, monto, descripcion=''} = req.body;

    const cuenta = await Cuenta.findByPk(cuenta_id);
    
    //Verificar si la cuenta existe
    if(!cuenta){
      return res.status(404).json({
        success: false,
        message: 'Cuenta encontrada'
      })
    }

    //Validar que la cuenta este activa
    if(cuenta.estado !== 'Activa'){
      return res.status(400).json({
        success: false,
        message: 'La cuenta se encuentra suspendida'
      });
    }
    
    //Validar que el monto sea positivo
    if(parseFloat(monto)<=0){
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un valor positivo'
      });
    }

    //crear la transaccion
    const transaccion = await Transaccion.create({
        cuenta_id,
        tipo_tra: 'deposito',
        monto: parseFloat(monto),
        descripcion
    });

    cuenta.balance = parseFloat(cuenta.balance) + parseFloat(monto);
    await cuenta.save();

    return res.status(201).json({
      success: true,
      message: 'Transaccion realizada con exito',
      data: transaccion
    });
  } catch (error){
    console.error('Error al crear la transaccion: ',error);
    // Manejo específico de errores de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
          success: false,
          message: 'Error de duplicación',
          error: error.message
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