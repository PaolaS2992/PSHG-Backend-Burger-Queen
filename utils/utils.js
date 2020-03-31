const { ObjectId } = require('mongodb');
const collection = require('../connection/collection');

module.exports.validateEmail = (email) => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
};

module.exports.getPagination = (url, page, limit, numbersPages) => {
    const firstPage = `<${url}?limit=${limit}&page=${1}>; rel="first"`;
    // console.log('firstPage', firstPage);
    const prevPage = `<${url}?limit=${limit}&page=${page - 1}>; rel="prev"`;
    // console.log('prevPage', prevPage);
    const nextPage = `<${url}?limit=${limit}&page=${page + 1}>; rel="next"`;
    // console.log('nextPage', nextPage);
    const lastPage = `<${url}?limit=${limit}&page=${numbersPages}>; rel="last"`;
    // console.log('lastPage', lastPage);
    return `${firstPage}, ${prevPage}, ${nextPage}, ${lastPage}`;
  };

  module.exports.getIdOrEmail = (uid) => {
    const queryUid = {};
    if (!(this.validateEmail(uid))) {
      queryUid._id = new ObjectId(uid);
    } else {
      queryUid.email = uid;
    }
    return queryUid;
  };

  module.exports.getProducts = (arrayIds, orderId, resp, next) => collection('products')
    .then((collectionProducts) => collectionProducts.find({ _id: { $in: arrayIds } }).toArray()
        .then((arrayProducts) => collection('orders')
        .then((collectionOrders) => collectionOrders.findOne({ _id: new ObjectId(orderId) }))
        .then((order) => {
          if (order === null) {
            return next(404);
          }
          // Renombramos propiedades en memoria de orders.
          order.products = order.products.map((elemProduct) => ({
            qty: elemProduct.qty,
            product: arrayProducts.find((p) => p._id.equals(elemProduct.productId)),
          }));
          // console.log(order);
          resp.send(order);
        })));