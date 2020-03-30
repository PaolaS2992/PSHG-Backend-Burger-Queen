const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const collection = require('../connection/collection');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
    /**
     * @name /auth
     * @description Crea token de autenticación.
     * @path {POST} /auth
     * @body {String} email Correo
     * @body {String} password Contraseña
     * @response {Object} resp
     * @response {String} resp.token Token a usar para los requests sucesivos
     * @code {200} si la autenticación es correcta
     * @code {400} si no se proveen `email` o `password` o ninguno de los dos
     * @auth No requiere autenticación
     */
    app.post('/auth', (req, resp, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(400);
        }
        // TODO: autenticar a la usuarix
        return collection('users')
          .then((collectionUser) => collectionUser.findOne({ email })
            .then((user) => {
                // console.log('Consulta db, si existe usuario: ', user);
                if (user === null) {
                    return next(404);
                }
                // BCRYPT --> Desencripta y compara password
                if (bcrypt.compareSync(password, user.password)) {
                    // JWT --> Generaciòn TOKEN.
                    // 1. Carga Util: Payload JWT
                    const payload = {
                        uid: user._id,
                        iss: 'burger-queen-api',
                        expiresIn: 60 * 60 *24,
                    }
                    // console.log('payload', payload);
                    // 2. Generar cadena JWT.
                    const token = jwt.sign(payload, secret);
                    // console.log('Si existe User en db, Genero Token: ', token);
                    resp.status(200).send({ token });
                }
            }));
    });

    return nextMain();
};