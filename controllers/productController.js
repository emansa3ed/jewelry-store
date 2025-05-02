const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
//  error formatter
const formatErrors = (errors) => ({
  success: false,
  errors: Array.isArray(errors) 
    ? errors 
    : Object.values(errors).map(err => ({
        field: err.path || err.param,
        message: err.msg || err.message
      }))
});
// Base validators for product updates
const baseProductValidator = [
  body('name')
    .optional()
    .not().isEmpty().withMessage('Name cannot be empty')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    
  body('description')
    .optional()
    .not().isEmpty().withMessage('Description cannot be empty')
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    
  body('price')
    .optional()
    .not().isEmpty().withMessage('Price cannot be empty')
    .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    
  body('category')
    .optional()
    .not().isEmpty().withMessage('Category cannot be empty')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid category ID');
      }
      const exists = await mongoose.model('Category').exists({ _id: value });
      if (!exists) throw new Error('Category does not exist');
      return true;
    }),
    
  body('stock')
    .optional()
    .not().isEmpty().withMessage('Stock cannot be empty')
    .isInt({ min: 0 }).withMessage('Stock must be zero or positive integer'),
    
  body('image')
    .optional()
    .not().isEmpty().withMessage('Image URL cannot be empty')
    .isURL().withMessage('Invalid image URL')
    .matches(/\.(jpe?g|png|webp|gif)$/i).withMessage('Image must be JPG, PNG, WEBP or GIF'),
    
  body('material')
    .optional()
    .not().isEmpty().withMessage('Material cannot be empty')
    .trim()
    .isLength({ min: 2 }).withMessage('Material must be at least 2 characters'),
    
  body('weight')
    .optional()
    .not().isEmpty().withMessage('Weight cannot be empty')
    .isFloat({ gt: 0 }).withMessage('Weight must be greater than 0')
];

// Validators for product creation
exports.validateProduct = [
  ...baseProductValidator,
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
    
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
    
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .custom(async (value) => {
       if (!mongoose.Types.ObjectId.isValid(value)) {
              throw new Error('Invalid category ID');
        }
      const exists = await mongoose.model('Category').exists({ _id: value });
      if (!exists) throw new Error('Category does not exist');
      return true;
    }),
    
  body('stock')
    .default(0)
    .isInt({ min: 0 })
    .withMessage('Stock must be zero or positive integer')
];
exports.validateProductUpdate = baseProductValidator;

exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(formatErrors(errors.array()));

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
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
    const products = await Product.find().populate('category', 'name');
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
exports.updateProduct = async (req, res, next) => {
  try {
    // 1. Run express-validator checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrors(errors.array()));
    }

    // 2. Check if product exists
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 3. Prepare update data with type conversion
    const updateData = {};
    const validFields = [
      'name', 'description', 'price', 'category', 
      'stock', 'image', 'material', 'weight'
    ];

    validFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Convert numbers explicitly
        if (['price', 'stock', 'weight'].includes(field)) {
          updateData[field] = Number(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // 4. Additional manual validation
    if (updateData.stock !== undefined && updateData.stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be zero or positive integer'
      });
    }

    // 5. Perform the update
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate('category', 'name');

    res.status(200).json({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    // Handle different error types
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
    next(error);
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




