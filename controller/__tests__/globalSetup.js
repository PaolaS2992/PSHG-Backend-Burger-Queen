const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = () => {
    const mongod = new MongoMemoryServer();
    return mongod.getConnectionString().then((urlConnection) => {
        process.env.DB_URL = urlConnection;
    });
}