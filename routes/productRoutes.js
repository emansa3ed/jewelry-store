const router = require('express').Router();
const { 
    createProduct,
    getProducts,
    getAllProducts, 
    getProductById,
    getProductsByName,
    getProductsByPrice,
    updateProduct,
    deleteProduct,
    validateProduct,
    validateProductUpdate 
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Route 
router.get('/search', getProductsByName);
router.get('/filter', getProductsByPrice);
router.get('/all', getAllProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);


router.post('/', protect, admin, validateProduct, createProduct);
router.patch('/:id', protect, admin, validateProductUpdate, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;