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
    const { numero_cuenta, monto, descripcion = '', tipo_dep = 'Efectivo', cajero = 'Desconocido', n_autorizacion = null } = req.body;

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

    const umbralVoluminoso = 10000;
    const esVoluminoso = parseFloat(monto) >= umbralVoluminoso;

    // Registrar transacción general
    await db.Transaccion.create({
      numero_cuenta,
      tipo_tra: 'Depósito',
      monto,
      descripcion,
      fecha_transaccion: new Date()
    });

    // Si es voluminoso, registrarlo en la tabla Depto_Vol
    if (esVoluminoso) {
      await Voluminoso.create({
        numero_cuenta,
        tipo_dep,
        monto,
        cajero,
        descripcion,
        n_autorizacion,
        fecha_depto: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: esVoluminoso
        ? 'Depósito voluminoso registrado con éxito'
        : 'Depósito registrado con éxito',
      voluminoso: esVoluminoso
    });

  } catch (error) {
    console.error('Error al registrar depósito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
