const db = require('../config/db.config.js');
const Voluminoso = db.Voluminoso;
const Cuenta = db.Cuenta;
const { validationResult } = require('express-validator');

exports.DepositoVoluminoso = async (req, res) => {
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

    // Validación adicional: ¿es un depósito voluminoso?
    const umbralVoluminoso = 10000; // Puedes cambiar este valor
    const esVoluminoso = parseFloat(monto) >= umbralVoluminoso;

    // Crear transacción
    const transaccion = await Transaccion.create({
      numero_cuenta,
      tipo_tra: 'deposito_voluminoso',
      monto: parseFloat(monto),
      descripcion,
      es_voluminoso: esVoluminoso // este campo debe existir en el modelo
    });

    cuenta.balance = parseFloat(cuenta.balance) + parseFloat(monto);
    await cuenta.save();

    return res.status(201).json({
      success: true,
      message: 'Depósito voluminoso realizado con éxito',
      data: transaccion
    });

  } catch (error) {
    console.error('Error al realizar el depósito voluminoso:', error);

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
  try {
    const transacciones = await Voluminoso.findAll();
    res.status(200).json({
      success: true,
      data: transacciones
    });
  } catch (error) {
    console.error('Error al obtener las transacciones voluminosas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las transacciones'
    });
  }
};
