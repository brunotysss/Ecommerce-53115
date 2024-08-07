const CartDAO = require('../dao/mongo/cart.dao');

class CartService {
  async createCart() {
    return await CartDAO.createCart();
  }

  async getCartById(id) {
    return await CartDAO.getCartById(id);
  }

  async addProductToCart(cartId, productId) {
    return await CartDAO.addProductToCart(cartId, productId);
  }
}

module.exports = new CartService();