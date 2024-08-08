const { Router } = require('express');
const multer = require('multer');
const UserController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profile') {
        cb(null, path.join(__dirname, 'uploads/profiles'));
      } else if (file.fieldname === 'product') {
        cb(null, path.join(__dirname, 'uploads/products'));
      } else {
        cb(null, path.join(__dirname, 'uploads/documents'));
      }
    },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/register', upload.none(), UserController.register);
router.post('/login', upload.none(), UserController.login);
router.post('/logout', authenticate, UserController.logout);
router.post('/refresh-token', UserController.refreshToken);

router.post('/:uid/documents', authenticate, upload.fields([
  { name: 'profile', maxCount: 1 },
  { name: 'product', maxCount: 10 },
  { name: 'document', maxCount: 10 }
]), UserController.uploadDocuments);

router.post('/premium/:uid', authenticate, UserController.upgradeToPremium);

// Ruta para generar usuarios de prueba
router.post('/generate-fake-users', async (req, res) => {
  try {                                                         
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        age: faker.random.number({ min: 18, max: 65 }),
        password: await bcrypt.hash('password', 10),
        role: 'user'
      };
      users.push(user);
    }
    await User.insertMany(users);
    res.json({ message: 'Fake users created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fake users', details: error.message });
  }
});

// Ruta para obtener todos los usuarios
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, 'first_name last_name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});
  
// Ruta para eliminar usuarios inactivos
router.delete('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const inactiveUsers = await User.find({ last_connection: { $lt: twoDaysAgo } });

    for (const user of inactiveUsers) {
      await User.deleteOne({ _id: user._id });
      // Enviar correo de notificación de eliminación de cuenta (agrega aquí la lógica para enviar correos)
    }

    res.json({ message: 'Inactive users deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inactive users', details: error.message });
  }
});

module.exports = router;
