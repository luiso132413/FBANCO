let express = require('express');
let router = express.Router();

const cliente = require('../controllers/cliente.controller.js');
const cuenta = require('../controllers/cuenta.controller.js');
const transaccion = require('../controllers/depositos.controller.js');

//rutas del cliente
router.post('/api/cliente/create', cliente.createCliente);
router.get('/api/cliente/all', cliente.getAllClientes);
router.get('/api/cliente/buscar', cliente.buscarCliente);
router.put('/api/cliente/actualizar', cliente.updateCliente);

//rutas de las cuentas
router.post('/api/cuenta/create', cuenta.crearCuenta);
router.put('/api/cuenta/suspender', cuenta.suspenderCuenta);
router.get('/api/cuenta/detalle', cuenta.obtenerDetalleCuenta);

//Rutas de depositos
router.post('/api/transaccion/deposito', transaccion.Depositos);
router.post('/api/transaccion/retirar', transaccion.Retiros);
router.get('/api/transaccion/all', transaccion.AllTransancciones);

module.exports = router;