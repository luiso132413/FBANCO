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
db.Cuenta = require('../models/cuenta.model.js')(sequelize, Sequelize);
db.Transaccion = require('../models/transaccion.model.js')(sequelize, Sequelize);

// Establecer relaciones
db.Cliente.hasMany(db.Cuenta, { foreignKey: 'cliente_id' });
db.Cuenta.belongsTo(db.Cliente, { foreignKey: 'cliente_id' });

db.Cuenta.hasMany(db.Transaccion, {foreignKey: 'cuenta_id'});
db.Transaccion.belongsTo(db.Cuenta, {foreignKey: 'cuenta_id'});


module.exports = db;