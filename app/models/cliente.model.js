const {password} = require('../config/env.js');

module.exports = (sequelize, Sequelize) =>{
  const Cliente = sequelize.define('cliente', {
    cliente_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    apellido: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    identificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.STRING(20),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    telefono: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    direccion: {
        type: Sequelize.STRING(30)
    },
    creado: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
  });

  return Cliente
}