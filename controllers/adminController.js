const User = require("../models/User");

exports.getAllUsers = async (req, res,next)=>{
    try {
       let users = await User.find();
       
       if (users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
       }
       res.json(users)
     
    } catch (error) {
        next(error)
        console.error('error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteUser = async(req,res)=>{
    try {
    const id = req.params.id
    const user = await User.findByIdAndDelete(id);
    if(!user){
        return res.status(404).json({message : 'User not found'})
    }
    res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
