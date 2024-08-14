/*const UserDAO = require('../dao/mongo/user.dao');
const UserDTO = require('../dto/user.dto');
*/
import crypto from 'crypto';
import UserDAO from '../dao/mongo/user.dao.js';
import UserDTO from '../dto/user.dto.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/index.js';
import { sendMail } from '../config/transport.js'; // Importa tu función de envío de correo

const { jwtSecret, refreshTokenSecret } = config;

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
  }
  async updateUserRefreshTokens(userId, refreshTokens) {
    const updatedUser = await UserDAO.updateUserRefreshTokens(userId, refreshTokens);
    return updatedUser ? new UserDTO(updatedUser) : null;
  }

  async addDocuments(userId, documents) {
    const user = await UserDAO.addDocuments(userId, documents);
    return new UserDTO(user);
  }

  /*
  async upgradeToPremium(userId) {
    const user = await UserDAO.getUserById(userId);
    if (!user) throw new Error('User not found');

    const requiredDocuments = ['profile', 'product', 'document'];
    const hasAllDocuments = requiredDocuments.every(doc => 
      user.documents.some(userDoc => userDoc.name === doc)
    );

    if (!hasAllDocuments) throw new Error('User has not completed all required documents');

    user.role = 'premium';
    return await UserDAO.updateUser(user._id, { role: 'premium' });
  }
*/

async resetPassword(token, newPassword) {
  const user = await UserDAO.getUserByResetToken(token);

  if (!user || user.resetPasswordExpires < Date.now()) {
      throw new Error('Token is invalid or has expired');
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
      throw new Error('New password cannot be the same as the old password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await UserDAO.updateUser(user);
}






async upgradeToPremium(userId) {
  const user = await UserDAO.getUserById(userId);
  if (!user) throw new Error('User not found');

  const requiredDocuments = ['profile', 'product', 'document'];
  const hasAllDocuments = requiredDocuments.every(doc => 
      user.documents.some(userDoc => userDoc.name === doc)
  );

  if (!hasAllDocuments) throw new Error('User has not completed all required documents');

  user.role = 'premium';
  return await UserDAO.updateUser(user._id, { role: 'premium' });
}

// Lógica específica para admins (sin verificación de documentos)
async upgradeToPremiumAsAdmin(userId) {
  const user = await UserDAO.getUserById(userId);
  if (!user) throw new Error('User not found');

  user.role = 'premium';
  //return await UserDAO.updateUser(user._id, { role: 'premium' });
  return await UserDAO.upgradeUserToPremium(user._id, true);

}




  async login(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Actualizar la última conexión
    user.last_connection = Date.now();
    await user.save();

    // Generar tokens
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

    // Almacenar el refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { token, refreshToken , user  };
  }


  async deleteInactiveUsers() {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const inactiveUsers = await UserDAO.findInactiveUsers(twoDaysAgo);
  
    const deletedUsers = [];
    for (const user of inactiveUsers) {
      await UserDAO.deleteUser(user._id);
      await sendMail(user.email, 'Cuenta eliminada por inactividad', 'Tu cuenta ha sido eliminada debido a la inactividad.');
      deletedUsers.push(user.email);
    }
  
    return deletedUsers;
  }
  

  async getAllUsers() {
    const users = await UserDAO.getAllUsers(); // Obtener todos los usuarios desde el DAO
    return users.map(user => new UserDTO(user)); // Convertir cada usuario a DTO
  }


  async requestPasswordReset(email) {
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `http://localhost:8081/reset-password?token=${resetToken}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await UserDAO.updateUser (user._id, { 
      resetPasswordToken: user.resetPasswordToken, 
      resetPasswordExpires: user.resetPasswordExpires 
    });

    await sendMail(user.email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);

    return { message: 'Password reset link sent' };
  }

  
}




export default new UserService();

//module.exports = new UserService();
