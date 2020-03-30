const jwt = require('jsonwebtoken');
const collection = require('../connection/collection');
const { ObjectId } = require('mongodb');

module.exports = (secret) => (req, resp, next) => {
  // Obtiene la cabecera de autenticacion.
  const { authorization } = req.headers;
  // console.log('Recupero cabecera: ', req.headers);
  // console.log('Solo propiedad authorization: ', req.headers.authorization);

  if (!authorization) {
    return next();
  }
  // Separa el tipo de autenticacion : 'barer' del token generado.
  const [type, token] = authorization.split(' ');
  // console.log('Divido - tipo: ', type);
  // console.log('Divido - token: ', token);

  // Type lo convertimos en minuscula.
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  // Decodifica token { uid, secret, exp...}
  jwt.verify(token, secret, (err, decodeToken) => {
    if (err) {
      return next(403);
    }
    // console.log('Payload:', decodeToken);
    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    return collection('users')
      .then((collectionUser) => collectionUser.findOne({ _id: ObjectId(decodeToken.uid) })
      .then((user) => {
        // *** Asignamos usuario autenticado a la cabecera ***
        req.headers.user = user;
        // console.log('asignacion...', req.headers.user);
        return next();
      })
      .catch(() => next(404)));
  });
};

module.exports.isAuthenticated = (req) => (req.headers.user);

module.exports.isAdmin = (req) => (req.headers.user.roles.admin);
/* module.exports.isAdmin = (req) => {
  console.log('Nueva propiedad agregada a req.headers --> USER:', req.headers)
  return req.headers.user.roles.admin;
}; */

module.exports.isUser = (req) => (
  req.headers.user._id.toString() === req.params.uid
  || req.headers.user.email === req.params.uid
);

module.exports.requireAdminOrUser = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : module.exports.isAdmin(req) || module.exports.isUser(req)
      ? next()
      : next(403)
);

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => {
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next();
};
