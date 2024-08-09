const UserDAO = require('../dao/mongo/user.dao');
const UserDTO = require('../dto/user.dto');

class UserService {
  async createUser(userData) {
    const user = await UserDAO.createUser(userData);
    return new UserDTO(user);
  }

  async getUserByEmail(email) {
    return await UserDAO.getUserByEmail(email); // Devuelve el objeto User completo
  }

  async getUserById(id) {
    const user = await UserDAO.getUserById(id);
    return new UserDTO(user);
  }

  async getUserByRefreshToken(token) {
    const user = await UserDAO.getUserByRefreshToken(token);
    return user;
   // return new UserDTO(user);
    // return await ProductDAO.getProducts();
  }
  async updateUserRefreshTokens(userId, refreshTokens) {
    const updatedUser = await UserDAO.updateUserRefreshTokens(userId, refreshTokens);
    return updatedUser ? new UserDTO(updatedUser) : null;
  }

  async addDocuments(userId, documents) {
    const user = await UserDAO.addDocuments(userId, documents);
    return new UserDTO(user);
  }
  async upgradeToPremium(userId) {
    const user = await UserDAO.getUserById(userId);
    if (!user) throw new Error('User not found');

    const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
    const hasAllDocuments = requiredDocuments.every(doc => 
      user.documents.some(userDoc => userDoc.name === doc)
    );

    if (!hasAllDocuments) throw new Error('User has not completed all required documents');

    user.role = 'premium';
    return await UserDAO.updateUser(user._id, { role: 'premium' });
  }
}



module.exports = new UserService();
