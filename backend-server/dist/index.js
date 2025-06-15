"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}
const stripe = new stripe_1.default(stripeSecretKey, { apiVersion: '2025-02-24.acacia' });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/create-payment-intent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, recurringOption } = req.body;
    if (amount < 0.50) {
        res.status(400).send({ error: 'Amount must be at least $0.50' });
        return;
    }
    try {
        let clientSecret = null;
        if (recurringOption === 'One Time') {
            const paymentIntent = yield stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
            });
            clientSecret = paymentIntent.client_secret;
        }
        else {
            const product = yield stripe.products.create({
                name: 'Recurring Donation',
            });
            const price = yield stripe.prices.create({
                unit_amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                recurring: { interval: recurringOption.toLowerCase() },
                product: product.id,
            });
            const customer = yield stripe.customers.create({
                email: 'email@example.com', // Replace with actual email from your frontend
            });
            const subscription = yield stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: price.id }],
            });
            if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string' && subscription.latest_invoice.payment_intent) {
                const paymentIntent = subscription.latest_invoice.payment_intent;
                clientSecret = paymentIntent.client_secret;
            }
        }
        res.send({ clientSecret });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}));
// Ensure the raw body is parsed correctly for the webhook endpoint
app.post('/webhook', express_1.default.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        res.status(400).send('Webhook Error: Missing Stripe Signature');
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    switch (event.type) {
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            const customerEmail = invoice.customer_email;
            // Send email notification to customerEmail
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).send('Received webhook');
});
app.listen(3000, () => console.log('Server listening on port 3000'));
