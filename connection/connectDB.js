const { MongoClient } = require('mongodb');
const config = require('.././config');

let database;

module.exports = () => {
  if (!database) {
    return MongoClient.connect(config.dbUrl, { useUnifiedTopology: true })
      .then((client) => {
        database = client.db('PSHG-burger-queen');
        return database;
      });
  }
  return Promise.resolve(database);
};
