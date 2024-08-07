class CartDTO {
    constructor({ _id, products }) {
      this.id = _id;
      this.products = products.map(product => ({
        product: product.product._id,
        quantity: product.quantity
      }));
    }
  }
  
  module.exports = CartDTO;
  