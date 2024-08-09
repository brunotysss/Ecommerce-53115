const UserService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret, refreshTokenSecret } = require('../config/index');
const EmailService = require('../services/email.service');



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


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserService.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `http://localhost:8081/reset-password?token=${resetToken}`;
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(user.email, resetLink);

    res.json({ message: 'Password reset link sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request password reset', details: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await UserService.getUserByResetToken(token);

    if (!user || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Token is invalid or has expired' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password cannot be the same as the old password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
};

exports.getCurrentUser = (req, res) => {
  res.json(req.user);
};
