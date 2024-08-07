const CartDAO = require('../dao/mongo/cart.dao');
const ProductDAO = require('../dao/mongo/product.dao');
const CartDTO = require('../dto/cart.dto');

class CartService {
  async createCart() {
    const cart = await CartDAO.createCart();
    return new CartDTO(cart);
  }

  async getCartById(id) {
    const cart = await CartDAO.getCartById(id);
    return new CartDTO(cart);
  }

  async addProductToCart(cartId, productId) {
    const cart = await CartDAO.addProductToCart(cartId, productId);
    return new CartDTO(cart);
  }

  async updateCart(cartId, products) {
    const cart = await CartDAO.updateCart(cartId, products);
    return new CartDTO(cart);
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartDAO.updateProductQuantity(cartId, productId, quantity);
    return new CartDTO(cart);
  }

  async deleteProductFromCart(cartId, productId) {
    const cart = await CartDAO.deleteProductFromCart(cartId, productId);
    return new CartDTO(cart);
  }

  async deleteAllProductsFromCart(cartId) {
    const cart = await CartDAO.deleteAllProductsFromCart(cartId);
    return new CartDTO(cart);
  }

  async purchaseCart(cartId, userId) {
    const cart = await CartDAO.getCartById(cartId);
    if (!cart) throw new Error('Cart not found');

    const errors = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = await ProductDAO.getProductById(item.product);
      if (!product) {
        errors.push(`Product ${item.product} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(`Not enough stock for product ${product.title}`);
        continue;
      }

      product.stock -= item.quantity;
      await product.save();
      totalAmount += product.price * item.quantity;
    }

    const ticket = await TicketDAO.createTicket({
      code: uuidv4(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: userId,
    });

    cart.products = cart.products.filter(item => errors.includes(`Not enough stock for product ${item.product}`));
    await cart.save();

    return { totalAmount, errors };
  }
}

module.exports = new CartService();
