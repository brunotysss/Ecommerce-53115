const CartService = require('../services/cart.services');

exports.createCart = async (req, res) => {
  const newCart = await CartService.createCart();
  if (!newCart) return res.status(500).json({ error: 'Failed to create cart' });
  res.status(201).json(newCart);
};

exports.getCartById = async (req, res) => {
  const cart = await CartService.getCartById(req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  res.json(cart);
};

exports.addProductToCart = async (req, res) => {
  const updatedCart = await CartService.addProductToCart(req.params.cid, req.params.pid);
  if (!updatedCart) return res.status(500).json({ error: 'Failed to add product to cart' });
  res.json(updatedCart);
};