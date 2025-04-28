const { password } = require('../config/env');

module.exports = (sequelize, Sequelize) => {
    const Transaccion = sequelize.define('transaccion', {
        transa_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cuenta_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        tipo_tra: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        monto: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        descripcion: {
            type: Sequelize.STRING(50)
        },
        fecha_tra: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    },{
        tableName: 'transacciones'
    });

    return Transaccion;
};