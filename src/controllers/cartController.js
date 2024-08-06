const Cart = require('../dao/models/cartModel');

exports.createCart = async (req, res) => {
  try {
    const newCart = new Cart();
    await newCart.save();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
