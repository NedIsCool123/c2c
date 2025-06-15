import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

app.use(cors({ origin: '*' })); // Allow requests from any origin
app.use(express.json()); // Parse incoming JSON requests

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
  } catch (error) {
    console.error('Error creating PaymentIntent:', error); // Debug log
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});