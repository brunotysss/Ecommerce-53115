/*const CartDAO = require('../dao/mongo/cart.dao');
const ProductDAO = require('../dao/mongo/product.dao');
const CartDTO = require('../dto/cart.dto');
*/
import CartDAO from '../dao/mongo/cart.dao.js';
import ProductDAO from '../dao/mongo/product.dao.js';
import CartDTO from '../dto/cart.dto.js';
import TicketService from '../services/ticket.service.js';

class CartService {
  async createCart(userId) {
    const cart = await CartDAO.createCart(userId);
     // Log para ver el carrito después de crearlo
  
     if (!cart) {
      throw new Error('No se pudo crear el carrito');
  }

    return new CartDTO(cart);
  }
/*
  async getCartByUserId(userId) {
    const cart = await CartDAO.getCartByUserId(userId);
  return new CartDTO(cart);  // Retorna el DTO actualizado
}
*/
async getCartByUserId(userId) {
  try {
      const cart = await CartDAO.getCartByUserId(userId);
 
      return cart ? new CartDTO(cart) : null;
  } catch (error) {
    
      throw new Error('Error al obtener el carrito por UserID en el Service');
  }
}

  async getCartById(id) {
    const cart = await CartDAO.getCartById(id);
    return new CartDTO(cart);
  }






  async addProductToCart(cartId, productId) {
    // Llamar al DAO para agregar el producto al carrito
    const updatedCart = await CartDAO.addProductToCart(cartId, productId);

    // Verificar si el carrito fue actualizado
    if (!updatedCart) {
      throw new Error('Carrito o producto no encontrado');
    }

    // Retornar el carrito actualizado como DTO
    return new CartDTO(updatedCart);
  }

  /*
  async addProductToCart(userId, productId) {
    // Buscar si el usuario ya tiene un carrito
    let cart = await this.getCartByUserId(userId);
    // Si no existe, creamos un carrito nuevo
    if (!cart) {
        cart = await this.createCart(userId);
    }
    // Asegúrate de que el cartId se obtiene correctamente
    const cartId = cart.id;
    // Llamar a CartDAO para agregar el producto
    const updatedCart = await CartDAO.addProductToCart(cartId, productId);
    if (!updatedCart) {
        throw new Error('Carrito o producto no encontrado');
    }
    return new CartDTO(updatedCart);
}*/

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

  async purchaseCart(cartId, userId, userEmail) {
    const cart = await CartDAO.getCartById(cartId);

    if (!cart) {
        console.error('Carrito no encontrado en CartService');
        throw new Error('Cart not found');
    }
 // Verificar si el carrito está vacío
 if (cart.products.length === 0) {
  console.warn('El carrito está vacío');
  throw new Error('No se puede completar la compra con un carrito vacío');
}
    const errors = [];
    let totalAmount = 0;

    for (const item of cart.products) {
        const product = await ProductDAO.getProductById(item.product);
        if (!product) {
            console.error(`Producto con ID ${item.product} no encontrado`);
            errors.push(`Product ${item.product} not found`);
            continue;
        }

        if (product.stock < item.quantity) {
            console.warn(`Stock insuficiente para el producto ${product.title}`);
            errors.push(`Not enough stock for product ${product.title}`);
            continue;
        }

        product.stock -= item.quantity;
        await product.save();
        totalAmount += product.price * item.quantity;
    }

    const ticketData = {
        code: `TCK-${Date.now()}`,
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: userEmail, // Usamos el email pasado como parámetro
        userId: userId
    };

    console.log('Datos del ticket:', ticketData);

    const ticket = await TicketService.createTicket(ticketData);

    cart.products = cart.products.filter(item => errors.includes(`Not enough stock for product ${item.product}`));
    await cart.save();

    return { ticket, errors };
}








}


export default new CartService();

//module.exports = new CartService();
