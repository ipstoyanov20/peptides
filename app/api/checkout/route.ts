import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { items, customerName, customerEmail } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    const lineItems = items.map((item: any) => {
      let imageList: string[] = [];
      if (item.image) {
        if (item.image.startsWith('http')) {
          imageList = [item.image];
        } else if (!appUrl.includes('localhost')) {
          const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
          const imagePath = item.image.startsWith('/') ? item.image : `/${item.image}`;
          imageList = [encodeURI(`${baseUrl}${imagePath}`)];
        }
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: imageList,
          },
          unit_amount: Math.round(item.price * 100), // price in cents
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      customer_email: customerEmail || undefined,
      shipping_address_collection: {
        allowed_countries: ['BG'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      submit_type: 'pay',
      metadata: {
        customer_name: customerName || '',
        items: items.map((i: any) => `${i.name} (${i.quantity})`).join(', ').substring(0, 500),
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
