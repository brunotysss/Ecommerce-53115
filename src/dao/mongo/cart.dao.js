//const CartModel = require('./models/cart.model');

import CartModel from './models/cart.model.js';
class CartDAO {
  /*async createCart() {
    return await CartModel.create({});
  }*/
  async createCart(userId) {
    const newCart = await CartModel.create({ user: userId, products: [] });
       // Log para ver el carrito después de crearlo
  

       return newCart;
   // return await CartModel.create({ user: userId , products: []  });
  }

  async getCartByUserId(userId) {
    try {
        const cart = await CartModel.findOne({ user: userId }).populate('products.product');


        return cart;
    } catch (error) {

        throw new Error('Error al buscar el carrito por UserID');
    }
  }

  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  /*
  async getCartByUserId(userId) {
    return await CartModel.findOne({ user: userId }).populate('products.product');
  }*/

  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);

    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    return cart;

  }

    async updateProductQuantity(cartId, productId, quantity) {
      const cart = await CartModel.findById(cartId);
      if (!cart) return null;
  
      const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
  
      await cart.save();
      return cart;
    }
  
    async deleteProductFromCart(cartId, productId) {
      const cart = await CartModel.findById(cartId);
      if (!cart) return null;
  
      cart.products = cart.products.filter(p => p.product.toString() !== productId);
      await cart.save();
      return cart;
    }
  
    async deleteAllProductsFromCart(cartId) {
      const cart = await CartModel.findById(cartId);
      if (!cart) return null;
  
      cart.products = [];
      await cart.save();
      return cart;
  }
}

export default new CartDAO();
//module.exports = new CartDAO();