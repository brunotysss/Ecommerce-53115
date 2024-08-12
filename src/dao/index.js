import ProductDAO from './mongo/product.dao';
import CartDAO from './mongo/cart.dao';
import UserDAO from './mongo/user.dao';

export default {
  Product: ProductDAO,
  Cart: CartDAO,
  User: UserDAO,
};
