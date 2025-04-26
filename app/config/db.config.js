const env = require('../config/env.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  operatorsAliases: false,
  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle,
  },
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.Cliente = require('../models/cliente.model.js')(sequelize, Sequelize);

// Establecer relaciones
db.Customer.hasMany(db.Account, { foreignKey: 'customer_id' });
db.Account.belongsTo(db.Customer, { foreignKey: 'customer_id' });

db.Account.hasMany(db.Transaction, { foreignKey: 'account_id' });
db.Transaction.belongsTo(db.Account, { foreignKey: 'account_id' });

module.exports = db;