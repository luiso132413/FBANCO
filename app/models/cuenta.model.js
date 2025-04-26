const {password} = require('../config/db.config.js');

module.exports = (sequelize, Sequelize) => {
    const Cuenta = sequelize.define('cuenta',{
        cuenta_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        numero_cuenta:{
            type: Sequelize.STRING(20),
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

    Cuenta.generarNumeroCuenta = async function(){
        const randomNum = Math.floor(10000000 + Math.random() * 90000000);
        const numero_cuenta = `BAN-${randomNum}`;
    
        const exists = await Cuenta.findOne({ where: { numero_cuenta: numero_cuenta } });

        return exists ? this.generarNumeroCuenta() : numero_cuenta;
    };

    return Cuenta;
};