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
        const randomNum = Math.floor(10000000 + Math.random() * 90000000); // Genera un número de 8 dígitos
        const numero_cuenta = randomNum.toString(); // Convertimos a string (sin interpolación)
    
        const exists = await Cuenta.findOne({ where: { numero_cuenta } });

        if (exists) {
            return this.generarNumeroCuenta(); // Si existe, generamos otro
        }
        return numero_cuenta; // Si no existe, retornamos este número
    };

    return Cuenta;
};