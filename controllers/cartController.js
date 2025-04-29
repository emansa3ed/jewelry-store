const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images');

    if (!cart) {
      return res.json({ 
        success: true,
        data: { items: [] } 
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};


// addToCart,
// updateCartItem
// removeFromCart
// clearCart

