const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  getProductsByCategoryName,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getAllCategories);
router.get('/:categoryName/products', getProductsByCategoryName);


router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;