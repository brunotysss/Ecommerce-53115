const { Router } = require('express');
const CartController = require('../controllers/cartController'); // Asegúrate de importar el controlador correctamente

const router = Router();

router.post('/', CartController.createCart);
router.get('/:cid', CartController.getCartById);
router.post('/:cid/product/:pid', CartController.addProductToCart);
router.post('/:cid/purchase', CartController.purchaseCart);
router.put('/:cid', CartController.updateCart);
router.put('/:cid/product/:pid', CartController.updateProductQuantity);
router.delete('/:cid/product/:pid', CartController.deleteProductFromCart);
router.delete('/:cid', CartController.deleteAllProductsFromCart);

module.exports = router;
