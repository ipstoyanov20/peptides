import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-05-27.dahlia',
  appInfo: {
    name: 'Peptides E-commerce',
    version: '0.1.0',
  },
});
