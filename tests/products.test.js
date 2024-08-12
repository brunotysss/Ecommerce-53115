import * as chai from 'chai';
import supertest from 'supertest';
import server from '../src/app.js';

const { expect } = chai;
const requester = supertest(server);

// Función auxiliar para obtener el token de autenticación
const getAuthToken = async () => {
  const loginRes = await requester.post('/api/users/login').send({
    email: 'Admin@example.com', // Asegúrate de que estas credenciales son correctas
    password: 'password'
  });
  //console.log(loginRes.headers); // Verifica los encabezados
  const cookies = loginRes.headers['set-cookie'];
  if (!cookies) {
    throw new Error('No se encontraron cookies en la respuesta');
  }

  const token = cookies[0].split(';')[0].split('=')[1];
  //console.log('Token:', token);
  return token;
};


describe('Products API', () => {

  it('should GET all the products', async () => {
    const res = await requester.get('/api/products');

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('payload').that.is.an('array');
  });

  it('should POST a new product', async () => {
    const token = await getAuthToken(); // Obtener el token de autenticación

    const product = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 100,
      stock: 10,
      category: 'Test Category',
      code: 'TESTCODE123' 
    };
    
    const res = await requester.post('/api/products')
    .set('Cookie', `jwt=${token}`) // Asegúrate de enviar el token
    .send(product);

    //console.log('Respuesta del servidor:', res.body); // Agregar log para verificar la respuesta del servidor

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('_id');
    expect(res.body).to.have.property('title').eql('Test Product');
  });

  it('should GET a product by ID', async () => {
    const productId = '66b37052229822522bf75b31'; // Reemplaza con un ID válido de tu BD
    const res = await requester.get(`/api/products/${productId}`);
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id').eql(productId);
  });

  it('should UPDATE a product', async () => {
    const token = await getAuthToken(); // Obtener el token de autenticación

    const productId = '66b37052229822522bf75b31'; // Reemplaza con un ID válido de tu BD
    const updates = { price: 150 };
    
    const res = await requester.put(`/api/products/${productId}`)
    .set('Cookie', `jwt=${token}`) // Usar el token en la cabecera
    .send(updates);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('price').eql(150);
  });





  it('should DELETE a product', async () => {
    const token = await getAuthToken(); // Obtener el token de autenticación

    const productId = '66ba56d9bfb9ce37fb95c06b'; // Reemplaza con un ID válido de tu BD
    
    const res = await requester.delete(`/api/products/${productId}`).set('Cookie', `jwt=${token}`);
    console.log('Respuesta del servidor:', res.body); // Log para verificar la respuesta

    if (res.status === 404) {
      expect(res.body).to.have.property('error').eql('Product not found');
    } else {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message').eql('Product deleted successfully');
    }
  });
});
