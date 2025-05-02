const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Connect DB
const connectDB = function(){
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error(err));
}
module.exports = connectDB;