import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert('./firebase-admin-config.json'),
  projectId: 'c2cauth'
});

const db = admin.firestore();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

app.use(cors({ origin: '*' })); // Allow requests from any origin
app.use(express.json()); // Parse incoming JSON requests

// Create Payment Intent and store donation record
app.post('/create-payment-intent', async (req, res) => {
  console.log('Incoming request to /create-payment-intent with body:', req.body); // Debug log

  try {
    const { 
      amount, 
      donorInfo, 
      organizationInfo, 
      c2cSite, 
      tributeInfo 
    } = req.body;

    if (!amount || !donorInfo) {
      console.error('Error: Missing required fields in request body');
      return res.status(400).json({ error: 'Amount and donor information are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        donorEmail: donorInfo.email,
        c2cSite: c2cSite || 'National',
        amount: amount.toString()
      }
    });

    // Store donation record in Firestore
    const donationRecord = {
      paymentIntentId: paymentIntent.id,
      amount: amount,
      status: 'pending',
      donorInfo: donorInfo,
      organizationInfo: organizationInfo || null,
      c2cSite: c2cSite || 'National',
      tributeInfo: tributeInfo || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('donations').add(donationRecord);
    console.log('Donation record created with ID:', docRef.id);

    console.log('PaymentIntent created successfully:', paymentIntent.id); // Debug log
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      donationId: docRef.id 
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error); // Debug log
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update donation status after successful payment
app.post('/update-donation-status', async (req, res) => {
  try {
    const { paymentIntentId, status } = req.body;

    const donationsRef = db.collection('donations');
    const snapshot = await donationsRef.where('paymentIntentId', '==', paymentIntentId).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Donation record not found' });
    }

    const doc = snapshot.docs[0];
    await doc.ref.update({
      status: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Donation status updated:', paymentIntentId, status);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});