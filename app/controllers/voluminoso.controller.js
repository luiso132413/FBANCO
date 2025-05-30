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

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'La cuenta no existe'
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

    const deposito = await Voluminoso.create({
      numero_cuenta,
      monto: parseFloat(monto),
      tipo_dep,
      cajero,
      descripcion,
      n_autorizacion
    });

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
        message: 'Error de validación de Sequelize',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
