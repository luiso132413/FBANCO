const {password} = require('../config/db.config.js');

module.exports = (sequelize, Sequelize) => {
    const Cuenta = sequelize.define('cuenta',{
        cuenta_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
        },
        numero_cuenta:{
            type: Sequelize.INTEGER,
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

    Cuenta.generarNumeroCuenta = async function() {
        // Buscamos la cuenta con el número más alto
        const lastAccount = await Cuenta.findOne({
            order: [['numero_cuenta', 'DESC']],
            attributes: ['numero_cuenta']
        });
        
        // Si no hay cuentas, empezamos con 1
        let nextNumber = 1;
        
        if (lastAccount) {
            // Si hay cuentas, tomamos el último número y le sumamos 1
            nextNumber = lastAccount.numero_cuenta + 1;
        }
        
        return nextNumber;
    };

    return Cuenta;
};