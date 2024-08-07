const { Router } = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const ProductModel = require('../dao/mongo/models/product.model');
const faker = require('faker');
faker.locale = 'es';  // Configurar Faker.js para español
const router = Router();

router.get('/', getAllProducts);
router.get('/:pid', getProductById);
router.post('/', createProduct);
router.put('/:pid', updateProduct);
router.delete('/:pid', deleteProduct);


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

module.exports = router;