import * as chai from 'chai';
import supertest from 'supertest';
import server from '../src/app.js';

const { expect } = chai;
const requester = supertest(server);

describe('Carts API', () => {
  it('should POST a new cart', (done) => {
    requester
      .post('/api/carts')
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        done();
      });
  });

  it('should GET a cart by ID', (done) => {
    const cartId = 'some_cart_id'; // Reemplaza con un ID válido de tu BD
    requester
      .get(`/api/carts/${cartId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('_id').eql(cartId);
        done();
      });
  });

  it('should ADD a product to a cart', (done) => {
    const cartId = 'some_cart_id'; // Reemplaza con un ID válido de tu BD
    const productId = 'some_product_id'; // Reemplaza con un ID válido de tu BD
    requester
      .post(`/api/carts/${cartId}/product/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('products');
        done();
      });
  });

  it('should DELETE a product from a cart', (done) => {
    const cartId = 'some_cart_id'; // Reemplaza con un ID válido de tu BD
    const productId = 'some_product_id'; // Reemplaza con un ID válido de tu BD
    requester
      .delete(`/api/carts/${cartId}/product/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Product deleted');
        done();
      });
  });
});
