const Product = require('../models/Product');
const mongoose = require('mongoose');

const validateCategory = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error('Invalid category ID');
  }
  const exists = await mongoose.model('Category').exists({ _id: categoryId });
  if (!exists) throw new Error('Category does not exist');
  return true;
};



exports.createProduct = async (req, res) => {
  try {
    if (req.body.category) {
      await validateCategory(req.body.category);
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }
    if (error.message === 'Invalid category ID' || error.message === 'Category does not exist') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};



exports.getProducts = async (req, res, next) => {
  try {
      const products = await Product.find();
      res.json(products);
  } catch (error) {
      next(error);
  }
};



// return the name of category to each product
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category', 'name-_id');//exclude the _id field from category
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
}



exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        next(error);
    }
};



// update 
exports.updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.body.category) {
      await validateCategory(req.body.category);
    }


    //  Prepare update data 
    const updateData = {};
    const validFields = [
      'name', 'description', 'price', 'category', 
      'stock', 'image', 'material', 'weight'
    ];

    validFields.forEach(field => {
      if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
    //Perform the update
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate('category', 'name-_id');

    res.status(200).json({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }
    if (error.message === 'Invalid category ID' || error.message === 'Category does not exist') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};



// delete 
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};



// get product by name (filtration / search)

exports.getProductsByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ success: false, message: "Product name query is required." });
    }

    const products = await Product.find({
      name: { $regex: name, $options: "i" } // case-insensitive partial match
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

//طريقة الاستخدام فى postman
//GET /api/products/search?name=ring



// get product by price (filtration / search) greater than and less than 
exports.getProductsByPrice = async (req, res, next) => {
    try {
      const { price, gt, gte, lt, lte } = req.query;
  
      const priceFilter = {};
  
      if (price) {
        priceFilter.$eq = Number(price); // يساوي فقط
      }
  
      if (gt)  priceFilter.$gt  = Number(gt);
      if (gte) priceFilter.$gte = Number(gte);
      if (lt)  priceFilter.$lt  = Number(lt);
      if (lte) priceFilter.$lte = Number(lte);
  
      if (Object.keys(priceFilter).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide at least one price filter: price, gt, gte, lt, or lte.",
        });
      }
  
      const products = await Product.find({ price: priceFilter });
  
      res.status(200).json({ success: true, products });
    } catch (error) {
      next(error);
    }
  };
  
//GET /api/products/filter?gt=100&lt=500
//GET /api/products/filter?price=500




