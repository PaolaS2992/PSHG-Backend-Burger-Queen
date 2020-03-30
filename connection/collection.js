const getDatabase = require('./connectDB');

// Crear y obtener collections: user, products, orders, etc.
module.exports = (nameCollection) => getDatabase()
  .then((database) => database.collection(nameCollection));