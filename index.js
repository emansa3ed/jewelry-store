const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favoriteRoutes=require('./routes/favoriteRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
const userProfile=require('./routes/userRoutes');


dotenv.config();
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

// Connect DB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error(err));

app.get("/", (req, res) => {res.send("jewelry, store!");} );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
