require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { join } = require('path');
const { initializePassport } = require('./config/passport');
const compression = require('express-compression');
const productRoutes = require('./routes/product.router');
const cartRoutes = require('./routes/cart.router');
const viewsRoutes = require('./routes/view.router');
const ticketRoutes = require('./routes/ticket.router');
const userRoutes = require('./routes/user.router');
const exphbs = require('express-handlebars');
const path = require('path'); // Asegúrate de requerir path
const sessionRoutes = require('./routes/session.router');
const logger = require('./config/logger');
const swaggerRoutes = require('./routes/swagger'); // Importar rutas de Swagger
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Configurar Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use(compression({
  brotli: { enabled: true, zlib: {} }
}));

app.use(express.static(join(__dirname, 'public')));
app.use(session({
  secret: process.env.JWT_SECRET, // Usar el secreto desde .env
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/', viewsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/loggerTest', (req, res) => {
  req.logger.debug('This is a debug log');
  req.logger.http('This is an http log');
  req.logger.info('This is an info log');
  req.logger.warn('This is a warning log');
  req.logger.error('This is an error log');
  req.logger.fatal('This is a fatal log');

  res.send('Logger test complete');
});
const errorHandler = require('./middleware/errorHandler'); // Importar manejador de errores
app.use(errorHandler); // Usar manejador de errores

app.use('/', swaggerRoutes);

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
    console.log('MongoDB connected...');
    logger.info('MongoDB connected...');

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);

    });
  } catch (err) {
    console.error(err.message);
    logger.error('Failed to connect to MongoDB', err);

    process.exit(1);
  }
};

main();
