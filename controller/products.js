const { ObjectId } = require('mongodb');
const collection = require('../connection/collection');
const { getPagination } = require('../utils/utils');

module.exports = {
    getProducts: (req, resp, next) => {
        const url = `${req.protocol}://${req.get('host')}${req.path}`;
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
    
        return collection('products')
          .then((collectionProduct) => collectionProduct.countDocuments())
          .then((count) => {
            const numbersPages = Math.ceil(count / limit);
            const skip = (limit * page) - limit;
            return collection('products')
              .then((collectionProduct) => collectionProduct.find().skip(skip).limit(limit).toArray())
              .then((product) => {
                resp.set('link', getPagination(url, page, limit, numbersPages));
                resp.send(product);
              });
          })
          .catch(() => next(500));
      },

    createProduct: (req, resp, next) => {
        console.log('Soy body: ', req.body);
        if (!req.body.name && !req.body.price) {
            return next(400);
        }
        const newProduct = {
            name: req.body.name,
            price: req.body.price,
            image: req.body.image,
            type: req.body.type,
            dateEntry: new Date(),
        };
        return collection('products')
          .then((collectionProduct) => collectionProduct.insertOne(newProduct))
          .then((product) => {
              resp.send({
                  _id: product.ops[0]._id,
                  name: product.ops[0].name,
                  price: product.ops[0].price,
                  image: product.ops[0].image,
                  type: product.ops[0].type,
                  dateEntry: product.ops[0].dateEntry,
              });
          })
          .catch(() => next(500));
    },
    
    getProductId: (req, resp, next) => {
        console.log('soy productId: ', req.params.productId);
        let query;
        try {
            query = new ObjectId(req.params.productId);
        } catch (error) {
            return next(404);
        }
        return collection('products')
          .then((collectionProduct) => collectionProduct.findOne({ _id: query }))
          .then((product) => {
              if (!product) {
                  return next(404);
              }
              return resp.send({
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  type: product.type,
                  dateEntry: product.dateEntry,
              });
          })
          .catch(() => next(500));
    },

    updateProductId: (req, resp, next) => {
        let query;
        try{
            query = new ObjectId(req.params.productId);
        } catch (error) {
            return next(404);
        }
        return collection('products')
          .then((colllectionProduct) => colllectionProduct.findOne({ _id: query }))
          .then((product) => {
              if (!product) {
                  return next(404);
              }
              if (!req.body.name && !req.body.price && !req.body.image && !req.body.type) {
                  return next(400);
              }
              if (typeof (req.body.price) !== 'number') {
                  return next(400);
              }
              return collection('products')
                .then((collectionProduct) => collectionProduct.findOne({ _id: query }))
                .then((product) => {
                    return collection('products')
                      .then((collectionProduct) => collectionProduct.updateOne({ _id: query }, {
                          $set: {
                              name: req.body.name || product.name,
                              price: req.body.price || product.price,
                              image: req.body.image || product.image,
                              type: req.body.type || product.type,
                          }
                      }))
                      .then(() => collection('products'))
                      .then((collectionProduct) => collectionProduct.findOne({ _id: query }))
                      .then((product) => resp.send(product));
                });
          });
    },

    deleteProductId: (req, resp, next) => {
        let query;
        try{
            query = new ObjectId(req.params.productId);
        } catch (error) {
            return next(404);
        }
        return collection('products')
          .then((collectionProduct) => collectionProduct.findOne({ _id: query }))
          .then((product) => {
              if (!product) {
                  return next(404);
              }
              return collection('products')
                .then((collectionProduct) => collectionProduct.deleteOne({ _id: query }))
                .then(() => resp.send({ message: 'producto eliminado exitosamente' }));
          })
          .catch(() => next(500));
    },
};