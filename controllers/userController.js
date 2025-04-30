const User = require('../models/User');
const Order = require('../models/Order');
const Favorite = require('../models/Favorite');

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 2. Get orders with full product details
    const orders = await Order.find({ user: userId })
      .populate('products.product')
      .sort({ createdAt: -1 });

    // 3. Get favorites with full product details
    const favorite = await Favorite.findOne({ user: userId }).populate('products');

    // 4. Check for absence
    const noOrders = !orders || orders.length === 0;
    const noFavorites = !favorite || !favorite.products || favorite.products.length === 0;

    const response = {
      success: true,
      user,
      orders: noOrders ? "You have no orders yet." : orders,
      favorites: noFavorites ? "You have no favorite products yet." : favorite.products,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
