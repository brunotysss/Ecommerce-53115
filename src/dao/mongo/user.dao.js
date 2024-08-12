//const User = require('../mongo/models/user.model');
import User from '../mongo/models/user.model.js';


class UserDAO {
  async createUser(userData) {
    return await User.create(userData);
  }

  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  async getUserById(userId) {
    return await User.findById(userId);
  }

  async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  async getUserByRefreshToken(token) {
    return await User.findOne({ refreshTokens: token });
  }

  async updateUserRefreshTokens(userId, refreshTokens) {
    return await User.findByIdAndUpdate(userId, { refreshTokens }, { new: true });
  }
  async addDocuments(userId, documents) {
    return await User.findByIdAndUpdate(userId, { $push: { documents: { $each: documents } } }, { new: true });
  }

  async upgradeToPremium(userId) {
    const user = await User.findById(userId);
    if (!user) return null;

    const requiredDocuments = ['profile', 'document'];
    const hasAllDocuments = requiredDocuments.every(doc => 
      user.documents.some(userDoc => userDoc.name === doc)
    );

    if (!hasAllDocuments) return null;
    
    user.role = 'premium';
    return await user.save();
  }
}

export default new UserDAO();
//module.exports = new UserDAO();
