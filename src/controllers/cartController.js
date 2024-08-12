/*const CartService = require('../services/cart.service');
const TicketService = require('../services/ticket.service');
const ProductService = require('../services/product.service');
*/
import CartService from '../services/cart.service.js';
import TicketService from '../services/ticket.service.js';
import ProductService from '../services/product.service.js';

//exports.purchaseCart = async (req, res) => {
  export const purchaseCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await CartService.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let totalAmount = 0;
    const productsToPurchase = [];
    const productsUnavailable = [];

    for (const cartProduct of cart.products) {
      const product = await ProductService.getProductById(cartProduct.product);
      if (product.stock >= cartProduct.quantity) {
        product.stock -= cartProduct.quantity;
        await product.save();
        totalAmount += product.price * cartProduct.quantity;
        productsToPurchase.push(cartProduct);
      } else {
        productsUnavailable.push(cartProduct.product);
      }
    }

    // Crear el ticket
    if (productsToPurchase.length > 0) {
      const ticketData = {
        code: `TCK-${Date.now()}`,
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: req.user.email
      };

      await TicketService.createTicket(ticketData);
    }

    // Actualizar el carrito
    cart.products = productsUnavailable;
    await cart.save();

    res.json({
      message: 'Purchase completed',
      productsUnavailable
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete purchase', details: error.message });
  }
};
//exports.createCart = async (req, res) => {
  export const createCart = async (req, res) => {
  try {
    const newCart = await CartService.createCart();
    if (!newCart) {
      return res.status(400).json({ error: 'Failed to create cart' });
    }
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cart', details: error.message });
  }
};

//exports.getCartById = async (req, res) => {
  export const getCartById = async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart', details: error.message });
  }
};

//exports.addProductToCart = async (req, res) => {
  export const addProductToCart = async (req, res) => {
  try {
    const updatedCart = await CartService.addProductToCart(req.params.cid, req.params.pid);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart or product not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product to cart', details: error.message });
  }
};

//exports.updateCart = async (req, res) => {
  export const updateCart = async (req, res) => {
  try {
    const updatedCart = await CartService.updateCart(req.params.cid, req.body.products);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart', details: error.message });
  }
};

//exports.updateProductQuantity = async (req, res) => {
  export const updateProductQuantity =  async (req, res) => {
  try {
    const updatedCart = await CartService.updateProductQuantity(req.params.cid, req.params.pid, req.body.quantity);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart or product not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product quantity', details: error.message });
  }
};

//exports.deleteProductFromCart = async (req, res) => {
  export const deleteProductFromCart =  async (req, res) => {
  try {
    const updatedCart = await CartService.deleteProductFromCart(req.params.cid, req.params.pid);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart or product not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product from cart', details: error.message });
  }
};

//exports.deleteAllProductsFromCart = async (req, res) => {
   export const deleteAllProductsFromCart = async (req, res) => {
  try {
    const updatedCart = await CartService.deleteAllProductsFromCart(req.params.cid);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products from cart', details: error.message });
  }
};
