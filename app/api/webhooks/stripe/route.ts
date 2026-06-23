import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    if (!webhookSecret) {
      console.warn('Stripe Webhook Secret not found. Skipping signature verification (dev only).');
      event = JSON.parse(payload);
    } else {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
  } catch (err) {
    console.error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    console.log(`Payment successful for session: ${session.id}`);
    // Handle post-payment logic here (save to DB, send email, etc.)
  }

  return NextResponse.json({ received: true });
}
