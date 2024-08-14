import { Router } from 'express';
import ProductService from '../services/product.service.js';
import CartService from '../services/cart.service.js';
import UserController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js'; // Asegúrate de usar el middleware de autenticación
import CartController from '../controllers/cartController.js';
import TicketController from '../controllers/ticket.controller.js';

/*const { Router } = require('express');
const ProductService = require('../services/product.service');
const CartService = require('../services/cart.service');
*/
const router = Router();

router.get('/products', async (req, res) => {
  try {
    const products = await ProductService.getProducts(req.query);
    res.render('products', { products: products.payload });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.pid);
    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.cid);
    res.render('cart', { products: cart.products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart', details: error.message });
  }
});
router.get('/login', (req, res) => {
    res.render('login');
  });
  
  router.get('/register', (req, res) => {
    res.render('register');
  });

  router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
  });
  
  router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    res.render('reset-password', { token });
  });



// Vista para gestionar usuarios (solo accesible por el administrador)
router.get('/admin/manage-users', authenticate, authorize(['admin']), UserController.manageUsers);
router.get('/my-cart', authenticate, CartController.getCartByUser);
router.get('/ticket/:tid', authenticate, TicketController.getTicketById);


  export default router;

//module.exports = router;

