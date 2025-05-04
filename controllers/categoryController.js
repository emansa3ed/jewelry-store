const Product = require('../models/Product');
const Category = require('../models/Category');



exports.createCategory = async (req, res, next) => {
    try {
      const { name } = req.body;
      console.log(name);
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }
       // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists',
        existingCategory: {
          _id: existingCategory._id,
          name: existingCategory.name
        }
      });
    }
      const category = await Category.create
      ({ 
        name:name.trim()
       });
  
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // optional sorting

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByCategoryName = async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const products = await Product.find({ category: category._id })
      .populate('category', 'name');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};


exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category name is required' 
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any products are using this category
    const productsInCategory = await Product.findOne({ category: id });
    if (productsInCategory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products'
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // 204 No Content – success, no body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
