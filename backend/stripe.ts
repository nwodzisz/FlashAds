import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'rk_test_51ToVHgP1opFU7Nc6r57WLm9T1dwFuuqfiJfoeqWKuV7YB3cQjnX9bsr7tp3jzC4wNdewigbgqkcxPGXkfEStKYKq00AuHgA42c', {
  apiVersion: '2024-04-10' as any,
});
