const router=require("express").Router();
const {protect}= require('../middlewares/authMiddleware');

const {addToFavorite,getFavorite,removeFromFavorite}=require("../controllers/favoriteController")

router.post("/add", protect,addToFavorite);
router.get("/", protect,getFavorite);
router.delete("/:productId", protect,removeFromFavorite);

module.exports = router;


