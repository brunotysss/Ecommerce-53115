const express = require('express');
const mongoose = require('mongoose');
const compression = require('express-compression');
const { mongoUri, dbName } = require('./config');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');

const app = express();

app.use(compression({
    brotli: { enabled: true, zlib: {} }
}));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const main = async () => {
    try {
        await mongoose.connect(mongoUri, { dbName });
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
