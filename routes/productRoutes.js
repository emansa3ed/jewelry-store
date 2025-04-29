const router = require('express').Router();
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect,createProduct); // Only authenticated can create // 
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;