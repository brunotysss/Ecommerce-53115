import UserService from '../services/user.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/index.js';
import crypto from 'crypto';

const { jwtSecret, refreshTokenSecret } = config;

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserService.createUser({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword
        });

        if (req.headers['x-postman']) {
            return res.status(201).json(user);
        }

        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
};
const manageUsers = async(req, res) => {
    try {
      const users = await UserService.getAllUsers(); // Obten todos los usuarios desde el servicio
     
      res.render('managerUsers', { users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  };


const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const { token, refreshToken , user } = await UserService.login(email, password);
  
      res.cookie('jwt', token, { httpOnly: true, secure: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
  // Envía el token JWT en una cookie HTTP
  // Establecer la cookie JWT
     // Establecer las cookies
     res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
        sameSite: 'lax',
        path: '/', // Asegura que la cookie esté disponible para todas las rutas
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
        sameSite: 'lax',
        path: '/', // Asegura que la cookie esté disponible para todas las rutas
      });
    // Redirige según el rol del usuario
    if (user.role === 'admin') {
        return res.redirect('/admin/manage-users');
      }
      return res.redirect('/products');
    //  res.redirect('/products');
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };


const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const user = await UserService.getUserById(decoded.id);
        if (!user || !user.refreshTokens.includes(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });

        const newToken = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();
            // Establecer las cookies
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
        sameSite: 'lax',
        path: '/', // Asegura que la cookie esté disponible para todas las rutas
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
        sameSite: 'lax',
        path: '/', // Asegura que la cookie esté disponible para todas las rutas
      });

        res.cookie('jwt', newToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
        res.json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh token', details: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        const user = await UserService.getUserByRefreshToken(refreshToken);

        if (user) {
            user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
            await user.save();
        }

        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        res.redirect('/login');  
      } catch (error) {
        res.status(500).json({ error: 'Failed to logout', details: error.message });
    }
};

const uploadDocuments = async (req, res) => {
    try {
        const userId = req.params.uid;
        const files = req.files;

        const documents = [];
        if (files.profile) {
            documents.push({ name: 'profile', reference: files.profile[0].path });
        }
        if (files.product) {
            files.product.forEach(file => {
                documents.push({ name: 'product', reference: file.path });
            });
        }
        if (files.document) {
            files.document.forEach(file => {
                documents.push({ name: 'document', reference: file.path });
            });
        }

        const user = await UserService.addDocuments(userId, documents);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload documents', details: error.message });
    }
};
/*
const upgradeToPremium = async (req, res) => {
    try {
        const userId = req.params.uid;
        const user = await UserService.upgradeToPremium(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found or missing documents' });
        }
        res.json({ message: 'User upgraded to premium', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upgrade user', details: error.message });
    }
};
*/
/*
const upgradeToPremium = async (req, res) => {
    try {
        const userId = req.params.uid;

        // Si el usuario es admin, no necesitamos verificar los documentos
        if (req.user.role === 'admin') {
            const user = await UserService.upgradeToPremiumAsAdmin(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
           return res.redirect('/admin/manage-users');

       /////    return res.json({ message: 'User upgraded to premium by admin', user });
        }

        // Si no es admin, seguimos la lógica estándar
        const user = await UserService.upgradeToPremium(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found or missing documents' });
        }

        res.json({ message: 'User upgraded to premium', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upgrade user', details: error.message });
    }
};*/



const upgradeToPremium = async (req, res) => {


  try {
      const userId = req.params.uid;
      let user;

      if (req.user.role === 'admin') {
          user = await UserService.upgradeToPremiumAsAdmin(userId);
      } else {
          user = await UserService.upgradeToPremium(userId);
      }

      if (!user) {
          return res.status(404).json({ error: 'User not found or missing documents' });
      }

      res.redirect('/admin/manage-users'); // Redirigir a la vista de gestión de usuarios
  } catch (error) {
      res.status(500).json({ error: 'Failed to upgrade user', details: error.message });
  }
};


const forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;
      await UserService.requestPasswordReset(email);
      res.redirect('/login'); // Redirige al login después de enviar el correo

     // res.json({ message: 'Password reset link sent' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to request password reset', details: error.message });
  }
};




const resetPassword = async (req, res) => {
  try {
      const { token, newPassword } = req.body;
      await UserService.resetPassword(token, newPassword);
 res.redirect('/login'); // Redirige al login después de que la contraseña ha sido cambiada

     // res.json({ message: 'Password has been reset' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};




const getCurrentUser = (req, res) => {
    res.json(req.user);
};


 const deleteInactiveUsers = async (req, res) => {
    try {
      const deletedUsers = await UserService.deleteInactiveUsers();
      res.json({ message: 'Inactive users deleted successfully', deletedUsers });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete inactive users', details: error.message });
    }
  };


// Exportamos todas las funciones en un objeto

export default {
    deleteInactiveUsers,
    manageUsers,
    register,
    login,
    refreshToken,
    logout,
    uploadDocuments,
    upgradeToPremium,
    forgotPassword,
    resetPassword,
    getCurrentUser
};
