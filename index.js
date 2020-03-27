const express = require('express');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');
const connectMongoDb = require('./connection/connectDB');

const { port, secret } = config;
const app = express();

// TODO: Conección a la BD en mogodb
connectMongoDb()
  .then(() => {
    app.set('config', config); // app.set(nombre, valor) | Asigna configuraciòn.*
    app.set('pkg', pkg);

    // parse application/x-www-form-urlencoded
    // app.use(path, callback()) | Monta las funciones Middleware especificadas en la ruta
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(authMiddleware(secret));

    // Registrar rutas
    routes(app, (err) => {
      if (err) {
        throw err;
      }

      app.use(errorHandler);

      app.listen(port, () => {
        console.info(`App listening on port ${port}`);
      });
    });
  });
