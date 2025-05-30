const db = require('../config/db.config.js');
const Transaccion = db.Transaccion;
const Cuenta = db.Cuenta;
const { validationResult } = require('express-validator');

exports.Depositos = async (req, res) => {
  const requiredFields = ['monto'];
  for (const field of requiredFields) {
    if (!req.body[field]){
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

  try{
    const {numero_cuenta, monto, descripcion=''} = req.body;

    const cuenta = await Cuenta.findByPk(numero_cuenta);
    
    if(!cuenta){
      return res.status(404).json({
        success: false,
        message: 'Cuenta encontrada'
      })
    }

    if(cuenta.estado !== 'Activa'){
      return res.status(400).json({
        success: false,
        message: 'La cuenta se encuentra suspendida'
      });
    }
    
    if(parseFloat(monto)<=0){
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un valor positivo'
      });
    }

    const transaccion = await Transaccion.create({
        numero_cuenta,
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

exports.Retiros = async (req, res) => {
  const requiredFields = ['monto'];
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
    const { numero_cuenta, monto, descripcion = '' } = req.body;

    const cuenta = await Cuenta.findByPk(numero_cuenta);
    
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    if (cuenta.estado !== 'Activa') {
      return res.status(400).json({
        success: false,
        message: 'La cuenta se encuentra suspendida'
      });
    }
    
    if (parseFloat(monto) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un valor positivo'
      });
    }

    if (parseFloat(cuenta.balance) < parseFloat(monto)) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para realizar el retiro'
      });
    }

    const transaccion = await Transaccion.create({
      numero_cuenta,
      tipo_tra: 'retiro',
      monto: parseFloat(monto),
      descripcion
    });

    cuenta.balance = parseFloat(cuenta.balance) - parseFloat(monto);
    await cuenta.save();

    return res.status(201).json({
      success: true,
      message: 'Retiro realizado con éxito',
      data: transaccion
    });
  } catch (error) {
    console.error('Error al crear la transacción de retiro: ', error);
    
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

exports.AllTransancciones = async (req, res) => {
  Transaccion.findAll().then(transaccion => {
    res.status(200).json({
      message: "Transacciones obtenidas exitosamente!",
      transaccion: transaccion,
    });
  }).catch(error => {
    console.log(error);
    res.status(500).json({
      message: "Error!",
      error: error,
    });
  });
};