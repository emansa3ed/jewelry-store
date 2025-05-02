const router = require('express').Router();
const { 
    createOrder, 
    getUserOrders, 
    getOrderById,
    getAllOrders,
    deletOrder 
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');


router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);  
router.get('/:id' , protect ,getOrderById);

router.get('/', protect, admin, getAllOrders); // Admin only
router.delete('/:id', protect, admin, deletOrder); // Admin only


module.exports = router;
