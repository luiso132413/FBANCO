const { password } = require('../config/env');

module.exports = (sequelize ,Sequelize) => {
    const Servicios = sequelize.define('servicio', {
        pago_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipo_servicio: {
            type: Sequelize.STRING(30)
        }, 
        pago: {
            type: Sequelize.DOUBLE
        },
        fecha_servi: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    },{
        tableName: 'servicios'
    });

    return Servicios;
}