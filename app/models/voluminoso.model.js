const { password } = require('../config/env.js');

module.exports = (sequelize, Sequelize) => {
    const Voluminoso = sequelize.define('voluminoso', {
        vol_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        numero_cuenta: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        tipo_dep: {
            type: Sequelize.STRING(30)
        },
        monto: {
            type: Sequelize.DOUBLE
        },
        cajero:{
            type: Sequelize.STRING(20)
        },
        descripcion: {
            type: Sequelize.STRING(30)
        },
        n_autorizacion: {
            type: Sequelize.INTEGER
        }, 
        fecha_depto: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'Depto_Vol'
    });

    return Voluminoso;
}