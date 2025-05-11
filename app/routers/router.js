let express = require('express');
let router = express.Router();

const cliente = require('../controllers/cliente.controller.js');
const cuenta = require('../controllers/cuenta.controller.js');
const transaccion = require('../controllers/depositos.controller.js');
const servicio = require('../controllers/servicio.controller.js');
const voluminoso = require('../controllers/voluminoso.controller.js');

//rutas del cliente
router.post('/api/cliente/create', cliente.createCliente);
router.get('/api/cliente/all', cliente.getAllClientes);
router.get('/api/cliente/buscar', express.json(), cliente.buscarCliente);
router.put('/api/cliente/actualizar', express.json(), cliente.updateCliente);

//rutas de las cuentas
router.post('/api/cuenta/create', cuenta.crearCuenta);
router.put('/api/cuenta/suspender', cuenta.suspenderCuenta);
router.get('/api/cuenta/detalle', cuenta.obtenerDetalleCuenta);

//Rutas de depositos
router.post('/api/transaccion/deposito', transaccion.Depositos);
router.post('/api/transaccion/retirar', transaccion.Retiros);
router.get('/api/transaccion/all', transaccion.AllTransancciones);

//Rutas de Servicios
router.post('/api/servicio/create', servicio.crearPago);
router.get('/api/servicio/all', servicio.allPagos);

//Rutass de Depositos Voluminoso
router.post('/api/voluminoso/create', voluminoso.DepositoVoluminoso );
router.get('/api/voluminoso/all', voluminoso.AllTransancciones);


module.exports = router;