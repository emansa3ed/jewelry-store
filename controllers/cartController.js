const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');

const formatErrors = (errors) => ({
  success: false,
  errors: Array.isArray(errors) 
    ? errors 
    : Object.values(errors).map(err => ({
        field: err.path || err.param,
        message: err.msg || err.message
      }))
});

exports.validateCartItem = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID');
      }
      const product = await Product.findById(value);
      if (!product) throw new Error('Product not found');
      return true;
    }),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Minimum quantity is 1')
    .custom(async (value, { req }) => {
      const product = await Product.findById(req.body.productId);
      if (value > product.stock) {
        throw new Error(`Only ${product.stock} available`);
      }
      return true;
    })
];
// Calculate cart totals
const calculateCartTotals = (cart) => {
  let totalItems = 0;
  let totalAmount = 0;
  
  const items = cart.items.map(item => {
    const itemTotal = item.product.price * item.quantity;
    totalItems += item.quantity;
    totalAmount += itemTotal;
    
    return {
      ...item.toObject(),
      price: item.product.price, // Price per unit
      total: itemTotal // Price × quantity
    };
  });

  return {
    items,
    totalItems,
    totalAmount
  };
};
exports.addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrors(errors.array()));
    }

    const { productId, quantity = 1 } = req.body;
    
    // Validate stock for the ADDED quantity
    const product = await Product.findById(productId);
    const cart = await Cart.findOne({ user: req.user._id }) || 
                 new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} available`
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name price image');
    res.json({
      success: true,
      data: calculateCartTotals(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};
// Get cart with totals
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image');
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    const cartData = calculateCartTotals(cart);
    
    res.json({
      success: true,
      data: cartData
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrors(errors.array()));
    }

    const { productId, quantity } = req.body;
    
    // Validate stock for the SET quantity
    const product = await Product.findById(productId);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} available`
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    const populatedCart = await cart.populate('items.product', 'name price image');
    res.json({
      success: true,
      data: calculateCartTotals(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

// Remove item
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    
    const populatedCart = await cart.populate('items.product', 'name price image');
    const cartData = calculateCartTotals(populatedCart);
    
    res.json({
      success: true,
      data: cartData
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const result = await Cart.deleteOne({ user: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No cart found to clear'
      });
    }
    res.status(200).json({
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalAmount: 0
      }
    });
    
  } catch (error) {
    next(error);
  }
};