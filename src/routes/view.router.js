const { Router } = require('express');
const ProductService = require('../services/product.service');
const CartService = require('../services/cart.service');

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

module.exports = router;

