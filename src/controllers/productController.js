const ProductService = require('../services/product.service');

exports.getAllProducts = async (req, res) => {
  const products = await ProductService.getAllProducts();
  if (!products) return res.status(500).json({ error: 'Failed to fetch products' });
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await ProductService.getProductById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const newProduct = await ProductService.createProduct(req.body);
  if (!newProduct) return res.status(500).json({ error: 'Failed to create product' });
  res.status(201).json(newProduct);
};

exports.updateProduct = async (req, res) => {
  const updatedProduct = await ProductService.updateProduct(req.params.pid, req.body);
  if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
  res.json(updatedProduct);
};

exports.deleteProduct = async (req, res) => {
  const deletedProduct = await ProductService.deleteProduct(req.params.pid);
  if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
};