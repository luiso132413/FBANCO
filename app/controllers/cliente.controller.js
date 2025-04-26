const db = require('../config/db.config');
const Cliente = db.Cliente;

const {validationResult} = require('express-validator');

exports.createCliente = async (req, res) => {
    let cliente = {};

    try{
        cliente.nombre = req.body.nombre;
        cliente.apellido =  req.body.apellido;
        cliente.identificacion = req.body.identificacion;
        cliente.email = req.body.email;
        cliente.telefono = req.body.telefono;
        cliente.direccion = req.body.direccion;


        Cliente.createCliente(cliente).then(result => {
            res.status(200).json({
                messege: "El cliente se ha ingresado correctamente" + result.cliente_id,
                cliente: result,
            });
        });
    } catch (error){
        res.status(500).json({
            message: "Error!",
            error: error.message,
        });
    }
}