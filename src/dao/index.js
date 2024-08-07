const ProductDAO = require('./mongo/product.dao');
const CartDAO = require('./mongo/cart.dao');

module.exports = {
  Product: ProductDAO,
  Cart: CartDAO,
};