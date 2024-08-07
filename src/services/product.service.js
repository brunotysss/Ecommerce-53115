const ProductDAO = require('../dao/mongo/product.dao');

class ProductService {
  async getAllProducts() {
    return await ProductDAO.getProducts();
  }

  async getProductById(id) {
    return await ProductDAO.getProductById(id);
  }

  async createProduct(product) {
    return await ProductDAO.createProduct(product);
  }

  async updateProduct(id, product) {
    return await ProductDAO.updateProduct(id, product);
  }

  async deleteProduct(id) {
    return await ProductDAO.deleteProduct(id);
  }
}

module.exports = new ProductService();