const ProductDAO = require('../dao/mongo/product.dao');
const ProductDTO = require('../dto/product.dto');

class ProductService {
    async getProducts(queryParams) {
        const { limit = 10, page = 1, sort, query } = queryParams;
      
        const options = {
          limit: parseInt(limit, 10),
          page: parseInt(page, 10),
          sort: sort === 'asc' ? 'price' : sort === 'desc' ? '-price' : undefined,
        };
      
        const filters = query ? { $or: [{ category: query }, { status: query === 'available' }] } : {};
    
        const { products, total } = await ProductDAO.getProducts(filters, options);
        const dtoProducts = products.map(product => new ProductDTO(product));
    
        return {
          status: 'success',
          payload: dtoProducts,
          totalPages: Math.ceil(total / options.limit),
          prevPage: options.page > 1 ? options.page - 1 : null,
          nextPage: options.page * options.limit < total ? options.page + 1 : null,
          page: options.page,
          hasPrevPage: options.page > 1,
          hasNextPage: options.page * options.limit < total,
          prevLink: options.page > 1 ? `/api/products?limit=${options.limit}&page=${options.page - 1}&sort=${options.sort}&query=${query}` : null,
          nextLink: options.page * options.limit < total ? `/api/products?limit=${options.limit}&page=${options.page + 1}&sort=${options.sort}&query=${query}` : null,
        };
      }
  async getAllProducts() {
    return await ProductDAO.getProducts();
  }
  async getProductById(id) {
    const product = await ProductDAO.getProductById(id);
    return new ProductDTO(product);
  }

  async createProduct(product) {
    return await ProductDAO.create(product);
  }

  async updateProduct(id, product) {
    const updatedProduct = await ProductDAO.updateProduct(id, product);
    return new ProductDTO(updatedProduct);
  }

  async deleteProduct(id) {
    return await ProductDAO.deleteProduct(id);
  }
}

module.exports = new ProductService();