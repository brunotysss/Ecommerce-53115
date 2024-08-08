const UserService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret, refreshTokenSecret } = require('../config/index');


exports.register = async (req, res) => {
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
      // Si la solicitud proviene de Postman, no redirigir
      return res.status(201).json(user);
    }

    res.redirect('/login');
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { email, password } = req.body;
    const user = await UserService.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    console.log("User found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    console.log("Password match:", isMatch);

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('jwt', token, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
   // res.json({ message: 'Logged in successfully', token });
   res.redirect('/products'); /// IMPORTANTE AGREGAR LUEGO LA REDIRECCION PARA MOSTRAR LOS PRODUCTOS DE LA DB MEDIANTE UN VIEW DE HANDLEBARS
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });

    const newToken = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie('jwt', newToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token', details: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const user = await UserService.getUserByRefreshToken(refreshToken);

    if (user) {
      console.log('User encontrado:', user); // Log para depuración
      console.log('User refreshTokens antes:', user.refreshTokens); // Log para depuración
      const updatedUser = await UserService.updateUserRefreshTokens(user.id, user.refreshTokens.filter(token => token !== refreshToken));

   //   user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
     // await user.findByIdAndUpdate(user._id, { refreshTokens: user.refreshTokens });

   //   await user.save();
   console.log('User refreshTokens después:', updatedUser.refreshTokens); // Log para depuración

    }

    res.clearCookie('jwt');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error en logout:', error); // Log para depuración

    res.status(500).json({ error: 'Failed to logout', details: error.message });
  }
};

exports.uploadDocuments = async (req, res) => {
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

exports.upgradeToPremium = async (req, res) => {
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
