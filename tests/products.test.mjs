// test/products.test.mjs
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../src/app.js'; // Asegúrate de que apunta a tu aplicación

chai.use(chaiHttp); // Usa el plugin chai-http
const { expect } = chai; // Extrae expect de chai

chai.use(chaiHttp);

describe('Products API', () => {
  it('should GET all the products', (done) => {
    chai.request(server)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        done();
      });
  });

  it('should POST a new product', (done) => {
    const product = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
      category: 'Test Category'
    };
    chai.request(server)
      .post('/api/products')
      .send(product)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('title').eql('Test Product');
        done();
      });
  });

  it('should GET a product by ID', (done) => {
    const productId = 'some_product_id'; // Reemplaza con un ID válido de tu BD
    chai.request(server)
      .get(`/api/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('_id').eql(productId);
        done();
      });
  });

  it('should UPDATE a product', (done) => {
    const productId = 'some_product_id'; // Reemplaza con un ID válido de tu BD
    const updates = { price: 150 };
    chai.request(server)
      .put(`/api/products/${productId}`)
      .send(updates)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('price').eql(150);
        done();
      });
  });

  it('should DELETE a product', (done) => {
    const productId = 'some_product_id'; // Reemplaza con un ID válido de tu BD
    chai.request(server)
      .delete(`/api/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Product deleted successfully');
        done();
      });
  });
});
