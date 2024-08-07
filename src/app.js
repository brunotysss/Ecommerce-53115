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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
    console.log('MongoDB connected...');

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

main();
