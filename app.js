const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favoriteRoutes=require('./routes/favoriteRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
const userProfile=require('./routes/userRoutes');


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/profile',userProfile);
app.use('/api/orders', orderRoutes);
app.use('/api/favorite',favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);

// Error Middleware
app.use(errorHandler);

app.get("/", (req, res) => {res.send("jewelry, store!");} );
module.exports = app;
