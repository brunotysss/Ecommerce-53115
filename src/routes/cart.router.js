/*const { Router } = require('express');
const CartController = require('../controllers/cartController'); // Asegúrate de importar el controlador correctamente
*/
import { Router } from 'express';
//import CartController from '../controllers/cartController.js'; 
const router = Router();
import { createCart, getCartById, addProductToCart, purchaseCart, updateCart, updateProductQuantity, deleteProductFromCart, deleteAllProductsFromCart } from '../controllers/cartController.js';

router.post('/', createCart);
router.get('/:cid', getCartById);
router.post('/:cid/product/:pid', addProductToCart);
router.post('/:cid/purchase', purchaseCart);
router.put('/:cid', updateCart);
router.put('/:cid/product/:pid', updateProductQuantity);
router.delete('/:cid/product/:pid',deleteProductFromCart);
router.delete('/:cid', deleteAllProductsFromCart);


export default router;

//module.exports = router;
