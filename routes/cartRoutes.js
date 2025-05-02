const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  validateCartItem
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');
router.use(protect);// to protect all cart routes
router.get('/', getCart);// Get user's cart
router.post('/', validateCartItem, addToCart);//Add item to cart
router.patch('/:productId', (req, res, next) => {
  req.body.productId = req.params.productId;
  next();
}, validateCartItem, updateCartItem);// Update cart item quantity
router.delete('/:productId', removeFromCart); //Remove item from cart
router.delete('/', clearCart);
module.exports = router;