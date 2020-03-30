const collection = require('../connection/collection');
const bcrypt = require('bcrypt');
const { validateEmail, getPagination, getIdOrEmail } = require('../utils/utils')

module.exports = {
  getUsers: (req, resp, next) => {
    // Crear url.
    const url = `${req.protocol}://${req.get('host')}${req.path}`;

    // Lìmite de documentos.
    const limit = parseInt(req.query.limit, 10) || 10 ;
    
    // Numero de paginas.
    const page = parseInt(req.query.page, 10) || 1;

    // Calcular saltos.
    return collection('users')
      .then((collectionUser) => collectionUser.countDocuments())
      .then((count) => {
        const numberPages = Math.ceil(count / limit);
        const skip = (limit * page) - limit;
        return collection('users')
          .then((collectionUser) => collectionUser.find().skip(skip).limit(limit).toArray())
          .then((users) => {
            resp.set('link', getPagination(url, page, limit, numberPages));
            resp.send(users);
          });
      })
      .catch(() => next(500));
  },
  createUser: (req, resp, next) => {
    // Captura datos directos del body.
    if (!req.body.email || !req.body.password) {
      return next(400);
    }
    if (!(validateEmail(req.body.email))) {
      return next(400);
    }
    if (req.body.password.length < 4) {
      return next(400);
    }
    // Des-estructurar Variable para crear nuevo usuario.
    const { email, roles = { admin: false} } = req.body;
    // Encriptar password.
    let { password } = req.body;
    password = bcrypt.hashSync(password, 10);

    return collection('users')
      .then((collectionUser) => collectionUser.findOne({ email }))
      .then((user) => {
        if (user) {
          return next(403);
        }
        return collection('users')
          .then((collectionUser) => collectionUser.createIndex({ email: 1 }, { unique: true }))
          .then(() => collection('users'))
          .then((collectionUser) => collectionUser.insertOne({ email, password, roles}))
          .then((newUser) => {
            // console.log('nuevo usuario: ', newUser.ops[0]);
            resp.send({
              _id: newUser.ops[0]._id,
              email: newUser.ops[0].email,
              roles: newUser.ops[0].roles,
            });
          });
      }).catch(() => next(500));
  },

  getUsersId: (req, resp, next) => {
    const uid = getIdOrEmail(req.params.uid);
    // console.log(uid);
    return collection('users')
      .then((collectionUser) => collectionUser.findOne(uid))
      .then((user) => {
        if(! user) {
          return next(404);
        }
        if(user !== null) {
          resp.send({
            _id: user._id,
            email: user.email,
            roles: user.roles,
          });
        }
      })
      .catch(() => next(500));
  },

  updateUserId: (req, resp, next) => {
    const uid = getIdOrEmail(req.params.uid);    
    return collection('users')
      .then((collectionUser) => collectionUser.findOne(uid))
      .then((user) => {
        if (!user) {
          return next(404);
        }
        if (!req.headers.user.roles.admin && req.body.roles) {
          return next(403);
        }
        if (!req.body.email && !req.body.password) {
          return next(400);
        }
        return collection('users')
          .then((collectionUser) => collectionUser.updateOne(uid, {
            $set: {
              email: req.body.email || user.email,
              password: req.body.password
                ? bcrypt.hashSync(req.body.password, 10)
                : user.password,
              roles: req.body.roles || user.roles,
            }
          }))
          .then(() => collection('users'))
          .then((collectionUser) => collectionUser.findOne(uid))
          .then((user) => resp.send(user));
      })
      .catch(() => next(500));
  },

  deleteUserId: (req, resp, next) => {
    const uid = getIdOrEmail(req.params.uid);
    return collection('users')
      .then((collectionUser) => collectionUser.findOne(uid))
      .then((user) => {
        if (!user) {
          return next(404);
        }
        return collection('users')
          .then((collectionUser) => collectionUser.deleteOne(uid))
          .then(() => resp.send({ message: 'usuario eliminado exitosamente' }));
      })
      .catch(() => next(500));
  },
};
