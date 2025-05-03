const db = require('../config/db.config.js');
const Voluminoso = db.Voluminoso;
const Cuenta = db.Cuenta;
const { validationResult } = require('express-validator');

exports.DepositoVoluminoso = async (req, res) => {
  const requiredFields = ['numero_cuenta', 'monto', 'tipo_dep', 'cajero'];
  for (const field of requiredFields) {
    if (!req.body[field]) {
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

  try {
    const { numero_cuenta, monto, tipo_dep, cajero, descripcion = '', n_autorizacion } = req.body;

    const cuenta = await Cuenta.findByPk(numero_cuenta);

    // Verificar si la cuenta existe
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'La cuenta no existe'
      });
    }

    // Validar que la cuenta esté activa
    if (cuenta.estado !== 'Activa') {
      return res.status(400).json({
        success: false,
        message: 'La cuenta se encuentra suspendida'
      });
    }

    // Validar que el monto sea positivo
    if (parseFloat(monto) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un valor positivo'
      });
    }

    // Crear el depósito voluminoso
    const deposito = await Voluminoso.create({
      numero_cuenta,
      monto: parseFloat(monto),
      tipo_dep,
      cajero,
      descripcion,
      n_autorizacion
    });

    // ✅ ACTUALIZAR BALANCE DE LA CUENTA
    cuenta.balance = parseFloat(cuenta.balance) + parseFloat(monto);
    await cuenta.save();

    return res.status(201).json({
      success: true,
      message: 'Depósito voluminoso realizado con éxito',
      data: deposito
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
