const db = require('../config/db.config.js');
const Cuenta = db.Cuenta;
const Cliente = db.Cliente;
const { validationResult } = require('express-validator');

exports.crearCuenta = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { cliente_id, tipo_cuenta } = req.body;

        console.log(`Buscando cliente con ID: ${cliente_id}`);

        const cliente = await Cliente.findByPk(cliente_id);
        if (!cliente) {
            console.error(`Cliente no encontrado para ID: ${cliente_id}`);
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const numero_cuenta = await Cuenta.generarNumeroCuenta();
        const cuenta = await Cuenta.create({
            cliente_id,
            numero_cuenta,
            tipo_cuenta,
            balance: 0.00,
            estado: 'Activa'
        });

        console.log('Cuenta creada:', cuenta);
        res.status(201).json(cuenta);
    } catch (error) {
        console.error('Error al crear la cuenta: ', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
