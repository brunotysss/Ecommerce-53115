const jwt = require('jsonwebtoken');
const { jwtSecret, refreshTokenSecret } = require('../config/index');
const UserService = require('../services/user.service');

exports.authenticate = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    console.log('Token recibido:', token); // Log para depuración
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decodificado:', decoded); // Log para depuración
    const user = await UserService.getUserById(decoded.id); // Usamos el UserService para obtener el usuario
    if (!user) {
      return res.status(401).json({ error: 'Access denied' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Error de verificación del token:', error); // Log para depuración

    res.status(400).json({ error: 'Invalid token' });
  }
};

exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
