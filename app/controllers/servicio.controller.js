const db = require('../config/db.config.js');
const Servicios = db.Servicios;

exports.crearPago = async (req, res) => {
    let servicios = {};

    try{
        servicios.tipo_servicio = req.body.tipo_servicio;
        servicios.pago = req.body.pago;

        Servicios.create(servicios).then(resutl => {
            res.status(200).json({
                messege: "El pago de su servicio ha sido efectuado" + resutl.pago_id,
                servicios: servicios,
            });
        });
    } catch (error) {
        res.status(500).json({
            messege: "Ups, algo salio mal",
            error: error.messege,
        });
    }
}

exports.allPagos = (req, res) => {
    Servicios.findAll().then(servicios => {
        res.status(200).json({
            messege: "Todas las transacciones mostradas",
            servicios: servicios,
        });
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            messege: "Error!",
            error: error,
        });
    });
}