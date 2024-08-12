/*const { Router } = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const ProductModel = require('../dao/mongo/models/product.model');
const { authenticate, authorize } = require('../middleware/auth');
const faker = require('faker');
*/
import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import ProductModel from '../dao/mongo/models/product.model.js';
import { authenticate, authorize } from '../middleware/auth.js';
import faker from 'faker';
faker.locale = 'es';  // Configurar Faker.js para español
const router = Router();

router.get('/', getAllProducts);
router.get('/:pid', getProductById);
/*router.post('/', createProduct);
router.put('/:pid', updateProduct);
router.delete('/:pid', deleteProduct);
*/
router.post('/', authenticate, authorize(['Admin', 'premium']), createProduct);
router.put('/:pid', authenticate, authorize(['Admin', 'premium']), updateProduct);
router.delete('/:pid', authenticate, authorize(['Admin', 'premium']), deleteProduct);
/*
router.post('/', authenticate, authorize(['admin', 'premium']), ProductController.createProduct);
router.put('/:id', authenticate, authorize(['admin', 'premium']), ProductController.updateProduct);
router.delete('/:id', authenticate, authorize(['admin', 'premium']), ProductController.deleteProduct);
*/
// Endpoint para inicializar datos
router.post('/init', async (req, res) => {
    try {
      await ProductModel.deleteMany({});
  
      const products = [];
      for (let i = 0; i < 20; i++) {
        products.push({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          code: faker.datatype.uuid(),
          price: parseFloat(faker.commerce.price()), // Asegurar que price sea un número
          status: faker.datatype.boolean(),
          stock: faker.datatype.number({ min: 1, max: 100 }),
          category: faker.commerce.department(),
          thumbnails: [faker.image.imageUrl(), faker.image.imageUrl()]
        });
      }
  
      await ProductModel.insertMany(products);
  
      res.status(201).json({ message: 'Initial data has been added successfully' });
    } catch (err) {
      console.error(err);  // Agregar log del error
      res.status(500).json({ error: 'Failed to initialize data', details: err.message });  // Incluir detalles del error en la respuesta
    }
  });

  export default router;

//module.exports = router;