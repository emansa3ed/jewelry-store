const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid Token' });
    }
};


exports.admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            message: 'Not authorized as admin' 
        });
    }
};