const {password} = require('../config/db.config.js');

module.exports = (sequelize, Sequelize) => {
    const Cuenta = sequelize.define('cuenta',{
        cuenta_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        numero_cuenta:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        tipo_cuenta: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        balance: {
            type: Sequelize.DOUBLE,
            defaultValue: 0.00
        },
        estado: {
            type: Sequelize.STRING(30),
            allowNull: false,
            defaultValue: 'Activa'
        },
        creada_cu: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW 
        }
    },{
        tableName: 'cuentas'
    });

    return Cuenta;
};