const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min:0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number,required:true, min:0, default: 0  },
  image: String,
  material: String,
  weight:{ type: Number , min:0.01},
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
