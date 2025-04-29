const router = require('express').Router();
const { 
    createOrder, 
    getUserOrders, 
    getOrderById,
    getAllOrders 
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Apply protect middleware to all order routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);  

router.get('/:id' , protect ,getOrderById);
router.get('/', protect, admin, getAllOrders); // Admin only


module.exports = router;