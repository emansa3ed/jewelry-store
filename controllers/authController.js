const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.create({ name, email, password: hashedPassword, otpCode: otp, otpExpire });

        await sendEmail(email, 'Verify your Email', `Your OTP is: ${otp}`);

        res.status(201).json({ message: 'User registered. Please verify your email.' });
    } catch (error) {
        console.log(error)
        next(error);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Email' });

        if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

        if (user.otpCode !== otp || user.otpExpire < new Date())
            return res.status(400).json({ message: 'Invalid or expired OTP' });

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch (error) {
        next(error);
    }
};
