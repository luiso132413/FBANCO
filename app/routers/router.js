let express = require('express');
let router = express.Router();

const cliente = require('../controllers/cliente.controller.js');
const cuenta = require('../controllers/cuenta.controller.js');

//rutas del cliente
router.post('/api/cliente/create', cliente.createCliente);

//rutas de las cuentas
router.post('/api/cuenta/create', cuenta.crearCuenta);

module.exports = router;