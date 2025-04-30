const Product = require('../models/Product');

exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
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


// delete 

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