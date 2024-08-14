/*class CartDTO {
  constructor({ _id,user, products }) {
    this.id = _id;
    this.user = user;
    this.products = products.map(product => ({
      product: product.product._id,
      quantity: product.quantity
    }));
  }
}*/
class CartDTO {
  constructor({ _id, user, products }) {
    this.id = _id.toString(); // Asegúrate de que _id se convierte en string y se almacena como `id`
    this.user = user.toString(); // Si user es un ObjectId, conviértelo a string
    this.products = products.map(product => ({
      product: {
        id: product.product._id.toString(), // Convertir ObjectId a string
        title: product.product.title,
        price: product.product.price,
        stock: product.product.stock
      },
      quantity: product.quantity
    }));
  }
}


export default CartDTO;
