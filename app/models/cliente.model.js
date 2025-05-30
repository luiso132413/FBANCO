const {password} = require('../config/env.js');

module.exports = (sequelize, Sequelize) => {
  const Cliente = sequelize.define('cliente', {
    identificacion: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    apellido: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    direccion: {
      type: Sequelize.STRING(100)
    },
    creado: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: 'clientes',
    timestamps: false 
  });

  return Cliente;
}