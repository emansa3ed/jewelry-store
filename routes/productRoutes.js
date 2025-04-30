const router = require('express').Router();
const { 
    createProduct,
     getProducts,
     getProductById ,
     getProductsByName,
     getProductsByPrice

} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect,createProduct); // Only authenticated can create // 
router.get('/', getProducts);
router.get('/filter', getProductsByPrice);
router.get('/search', getProductsByName);
router.get('/:id', getProductById);


module.exports = router;