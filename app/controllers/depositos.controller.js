const db = require('../config/db.config.js');
const Cuenta = require('../models/cuenta.model.js');
const Transaccion = require('../models/transaccion.model.js');
const { validationResult } = require('express-validator');

exports.Depositar = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { numero_cuenta, monto, descripcion } = req.body;

        const cuenta = await Cuenta.findOne({where: {numero_cuenta} });
        if(!cuenta) {
            return res.status(400),json({ error: 'Cuenta no econtrada'});
        }

        if(cuenta.estado !== 'Activa') {
            return res.status(400),json({ error: 'La cuenta no esta Activa'});
        }const transaccion = await Transaction.create({
            cuenta_id: cuenta.cuenta_id,
            type: 'deposito',
            monto,
            descripcion: descripcion || 'Depósito en efectivo'
          });
      
          cuenta.balance = parseFloat(cuenta.balance) + parseFloat(monto);
          await cuenta.save();
      
          res.status(201).json({
            message: 'Depósito realizado',
            transaccion,
            new_balance: cuenta.balance
          });
        } catch (error) {
          console.error('Error al procesar depósito:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
};

exports.Retirar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { numero_cuentar, monto, descripcion } = req.body;
      
      const cuenta = await Cuenta.findOne({ where: { numero_cuentar } });
      if (!cuenta) {
        return res.status(404).json({ error: 'Cuenta no encontrada' });
      }
  
      if (cuenta.status !== 'activa') {
        return res.status(400).json({ error: 'La cuenta no está activa' });
      }
  
      if (parseFloat(cuenta.balance) < parseFloat(monto)) {
        return res.status(400).json({ error: 'Fondos insuficientes' });
      }
  
      const transaccion = await Transaccion.create({
        cuenta_id: cuenta.cuenta_id,
        type: 'retiro',
        monto,
        descripcion: descripcion || 'Retiro en efectivo'
      });
  
      cuenta.balance = parseFloat(cuenta.balance) - parseFloat(monto);
      await cuenta.save();
  
      res.status(201).json({
        message: 'Retiro realizado',
        transaccion,
        new_balance: cuenta.balance
      });
    } catch (error) {
      console.error('Error al procesar retiro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };