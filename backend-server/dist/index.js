"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4242;
// Initialize Stripe
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
});
app.use((0, cors_1.default)({ origin: '*' })); // Allow requests from any origin
app.use(express_1.default.json()); // Parse incoming JSON requests
// Create Payment Intent
app.post('/create-payment-intent', async (req, res) => {
    console.log('Incoming request to /create-payment-intent with body:', req.body); // Debug log
    try {
        const { amount } = req.body;
        if (!amount) {
            console.error('Error: Missing amount in request body');
            return res.status(400).json({ error: 'Amount is required' });
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });
        console.log('PaymentIntent created successfully:', paymentIntent); // Debug log
        res.json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error('Error creating PaymentIntent:', error); // Debug log
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
