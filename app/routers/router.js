let express = require('express');
let router = express.Router();

const cliente = require('../controllers/cliente.controller.js');
const cuenta = require('../controllers/cuenta.controller.js');

//rutas del cliente
router.post('/api/cliente/create', cliente.createCliente);
router.get('/api/cliente/all', cliente.getAllClientes);

//rutas de las cuentas
router.post('/api/cuenta/create', cuenta.crearCuenta);
router.put('/api/cuenta/numerocuenta', cuenta.suspenderCuenta);
router.get('/api/cuenta/numerocuenta', cuenta.obtenerDetalleCuenta);

module.exports = router;