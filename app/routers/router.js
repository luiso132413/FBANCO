let express = require('express');
let router = express.Router();

const cliente = require('../controllers/cliente.controller');

//rutas del cliente
router.post('/api/cliente/create', cliente.createCliente);

module.exports = router;