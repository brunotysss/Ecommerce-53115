const ProductService = require('../services/product.service');


exports.getAllProducts = async (req, res) => {
    try {
      const products = await ProductService.getProducts(req.query);
      if (!products || products.payload.length === 0) {
        return res.status(404).json({ error: 'No products found' });
      }
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
  };

  exports.getProductById = async (req, res) => {
    try {
      const product = await ProductService.getProductById(req.params.pid);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
  };
  

  exports.createProduct = async (req, res) => {
    try {
      const newProduct = await ProductService.createProduct(req.body);
      if (!newProduct) {
        return res.status(400).json({ error: 'Failed to create product' });
      }
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
  };
  
      
  exports.updateProduct = async (req, res) => {
    try {
      const updatedProduct = await ProductService.updateProduct(req.params.pid, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
  };
      
  exports.deleteProduct = async (req, res) => {
    try {
      const deletedProduct = await ProductService.deleteProduct(req.params.pid);
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
  };