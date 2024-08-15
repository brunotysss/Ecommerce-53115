
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';  // Aquí ya estamos importando 'join'
import initializePassport from './config/passport.js';
import compression from 'express-compression';
import productRoutes from './routes/product.router.js';
import cartRoutes from './routes/cart.router.js';
import viewsRoutes from './routes/view.router.js';
import ticketRoutes from './routes/ticket.router.js';
import userRoutes from './routes/user.router.js';
// import path from 'path'; // Esta línea no es necesaria
import sessionRoutes from './routes/session.router.js';
import logger from './config/logger.js';
//import swaggerRoutes from './routes/swagger'; // Importar rutas de Swagger si es necesario
import errorHandler from './middleware/errorHandlebars.js';
import swaggerJSDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import emailRouter from './routes/email.router.js'; // Asegúrate de que la ruta sea correcta
import exphbs from 'express-handlebars';




//Admin@example.com usuario de prueba
//Admin@example.com usuario de prueba
// Obtener el directorio actual usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(cookieParser());
const hbs = exphbs.create({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    multiply: (a, b) => {
      a * b
  
      return a * b;
    }}
});
app.use((req, res, next) => {
  console.log("Cookies:", req.cookies);  // Verifica si las cookies llegan
  next();
});



app.engine('handlebars', hbs.engine); // Usar la instancia personalizada de Handlebars
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  req.logger = logger;
  next();
  
});
// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'E-commerce API',
            description: 'API documentation for the E-commerce application',
            version: '1.0.0',
        },
    },
  //  apis: [path.join(__dirname, '../docs/swagger.yml')],
  apis: [join(__dirname, '../docs/swagger.yml')],

};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

// Ruta para Swagger UI
app.use('/api-docs', serve, setup(swaggerSpecs));

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
//app.use(passport.session());

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/', viewsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/email', emailRouter);
app.get('/loggerTest', (req, res) => {
  req.logger.debug('This is a debug log');
  req.logger.http('This is an http log');
  req.logger.info('This is an info log');
  req.logger.warn('This is a warning log');
  req.logger.error('This is an error log');
  req.logger.fatal('This is a fatal log');

  res.send('Logger test complete');
});
app.use(errorHandler); // Usar manejador de errores

//app.use('/', swaggerRoutes);

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
// Aquí está la exportación por defecto
export default app;