const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
    try {
        const { products, shippingAddress, paymentMethod } = req.body;
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'No products in the order' 
            });
        }

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ 
                success: false,
                message: 'Shipping address and payment method are required' 
            });
        }

        // Process products and calculate total
        let totalAmount = 0;
        const orderProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Product not found with ID: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false,
                    message: `Insufficient stock for product: ${product.title}`
                });
            }

            totalAmount += product.price * item.quantity;
            
            orderProducts.push({
                product: item.product,
                quantity: item.quantity,
                priceAtPurchase: product.price
            });

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            products: orderProducts,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserOrders = async (req, res, next) => {
    try {
        // 1. Validate authentication
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // 2. Fetch orders with proper population
        const orders = await Order.find({ user: req.user.id })
            .populate({
                path: 'user',
                select: 'name email',
                options: { lean: true }
            })
            .populate({
                path: 'products.product',
                select: 'name image price stock', // Added stock for frontend display
                options: { lean: true }
            })
            .sort({ createdAt: -1 })
            .lean(); // Convert to plain JavaScript objects

        // 3. Format the response
        const formattedOrders = orders.map(order => ({
            ...order,
            formattedDate: new Date(order.createdAt).toLocaleDateString(),
            formattedTotal: order.totalAmount.toFixed(2)
        }));

        res.json({
            success: true,
            count: formattedOrders.length,
            data: formattedOrders
        });

    } catch (error) {
        console.error('Error in getUserOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'products.product',
                select: 'title image price description'
            });

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Authorization check here 
       

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate({
                path: 'products.product',
                select: 'name image'
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

