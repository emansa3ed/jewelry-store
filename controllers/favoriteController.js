const Favorite=require("../models/Favorite");

exports.addToFavorite = async (req, res, next) => {
    try {
      const { productId } = req.body;
      const userId = req.user.id;
  
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized user." });
      }
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required." });
      }
  
      let favorite = await Favorite.findOne({ user: userId });
  
      if (!favorite) {
        favorite = new Favorite({ user: userId, products: [] }); 
      }
  
      if (favorite.products.includes(productId)) {
        return res.status(200).json({ success: true, message: "Product already in favorites." });
      }
  
      favorite.products.push(productId);
      await favorite.save();
  
      res.status(201).json({ success: true, message: "Product added to favorites.", favorite });
    } catch (error) {
      next(error);
    }
  };
  

exports.getFavorite = async (req, res,next) => {
    const favorite = await Favorite.findOne({ user: req.user.id }).populate("products");
    if (!favorite || favorite.products.length === 0) {
        return res.status(200).json({ success: true, message: "No products in favorites.", favorite: { user: userId, products: [] } });
      }
    res.status(200).json({ success: true, favorite });
  };
  
  exports.removeFromFavorite = async (req, res,next) => {
    try{
    const { productId } = req.params;
    const favorite = await Favorite.findOne({ user: req.user.id });
    if (!favorite || !favorite.products.includes(productId)) {
        return res.status(404).json({ success: false, message: "Product not found in favorites." });
      }
    favorite.products = favorite.products.filter(p => p.toString() !== productId);
    await favorite.save();
  
    res.status(200).json({ success: true,  message: "Product removed from favorites.",favorite });
    }
    catch(error){
        console.error("Remove from Favorite Error:", error);
        next(error);
    }
};
  