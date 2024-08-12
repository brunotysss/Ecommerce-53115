import * as chai from 'chai';
import supertest from 'supertest';
import server from '../src/app.js';

const { expect } = chai;
const requester = supertest(server);
describe('Sessions API', () => {
  it('should REGISTER a new user', (done) => {
    const user = {
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser@example.com',
      password: 'testpassword'
    };
    chai.request(server)
      .post('/api/users/register')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('email').eql('testuser@example.com');
        done();
      });
  });

  it('should LOGIN a user', (done) => {
    const user = {
      email: 'testuser@example.com',
      password: 'testpassword'
    };
    chai.request(server)
      .post('/api/users/login')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.headers).to.have.property('set-cookie');
        done();
      });
  });

  it('should GET the current user session', (done) => {
    chai.request(server)
      .get('/api/users/current')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('email');
        done();
      });
  });
});
