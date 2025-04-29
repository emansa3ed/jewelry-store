const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    products: [
        {
            product: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product',
                required: true 
            },
            quantity: { 
                type: Number, 
                default: 1,
                min: [1, 'Quantity must be at least 1']
            }
        }
    ],
    totalAmount: { 
        type: Number, 
        required: true,
        min: [0, 'Total amount must be positive']
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'cash'],
        required: true
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted order date
OrderSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;