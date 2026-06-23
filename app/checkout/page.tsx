'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'econt' | 'stripe'>('econt');
  const [econtData, setEcontData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const econtCalcUrl = 'https://deliver.econt.com/delivery';
  const econtShopId = '5080473'; 
  const totalWeight = items.reduce((acc, item) => acc + (item.totalWeight || 0.1) * item.quantity, 0);
  const iframeUrl = `${econtCalcUrl}?id_shop=${econtShopId}&order_total=${total.toFixed(2)}&order_currency=BGN&order_weight=${totalWeight}`;

  useEffect(() => {
    const handleEcontMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.address !== undefined) {
        setEcontData((prev: any) => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      }
    };
    window.addEventListener('message', handleEcontMessage);
    return () => window.removeEventListener('message', handleEcontMessage);
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'econt') {
        if (!econtData) {
          alert('Моля, изберете офис на Еконт или адрес за доставка от картата.');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/econt/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            order_total: total,
            customerInfo: {
              id: econtData.id,
              name: econtData.name,
              phone: econtData.phone,
              email: econtData['e-mail'] || econtData.email || '',
              cityName: econtData.city_name,
              postCode: econtData.post_code,
              address: econtData.address,
              officeCode: econtData.office_code,
            }
          }),
        });
        
        const resData = await response.json();
        if (resData.success) {
          setSuccessMsg('Order successfully placed via Econt (Cash on Delivery)!');
          clearCart();
        } else {
          alert('Error: ' + (resData.error || 'Failed to place order.'));
        }
      } else {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customerName: 'Guest User',
          }),
        });
        const resData = await response.json();
        if (resData.url) {
          window.location.href = resData.url;
        } else {
          alert('Error: ' + (resData.error || 'Failed to initialize Stripe checkout.'));
        }
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="text-center py-32 glass-card max-w-2xl mx-auto mt-10 p-12">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{successMsg}</h1>
        <p className="text-slate-500 mb-8">Thank you for shopping with Peptides. Your items will be shipped soon.</p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-32 glass-card max-w-2xl mx-auto mt-10 p-12">
        <h1 className="text-3xl font-bold text-slate-700 mb-4">Your cart is empty.</h1>
        <p className="text-slate-500 mb-8">Looks like you haven't added any peptides yet.</p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">Return to shop</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-10 relative z-10">
      <div className="space-y-8">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-extrabold mb-6 text-slate-800">Order Summary</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700">{item.name}</h3>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-extrabold text-emerald-600">€{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 flex justify-between text-2xl font-black text-slate-800 border-t-2 border-emerald-100">
            <span>Total:</span>
            <span className="text-emerald-600">€{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-extrabold mb-6 text-slate-800">Delivery & Payment</h2>
          <div className="space-y-4">
            
            {/* ECONT */}
            <div 
              onClick={() => setPaymentMethod('econt')}
              className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'econt' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}
            >
              <div className="flex items-center gap-4">
                <Truck className={`w-8 h-8 ${paymentMethod === 'econt' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">Econt (Cash on Delivery)</h3>
                  <p className="text-sm text-slate-500">Pay when you receive the package.</p>
                </div>
                <img src="/econt-logo.png" alt="Econt" className="h-6 object-contain opacity-70" />
              </div>
              
              {paymentMethod === 'econt' && (
                <div className="mt-6">
                  <iframe 
                    src={iframeUrl} 
                    className="w-full h-[600px] rounded-xl bg-white border border-slate-200 shadow-inner" 
                    title="Econt Delivery" 
                  />
                  {econtData && (
                    <div className="mt-4 p-4 bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500 rounded-r-lg">
                      <p className="font-bold">Selected address:</p>
                      <p>{econtData.address || econtData.office_code}, {econtData.city_name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STRIPE */}
            <div 
              onClick={() => setPaymentMethod('stripe')}
              className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}
            >
              <div className="flex items-center gap-4">
                <CreditCard className={`w-8 h-8 ${paymentMethod === 'stripe' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">Card Payment (Stripe)</h3>
                  <p className="text-sm text-slate-500">Pay securely with Visa, Mastercard, Apple Pay.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="lg:sticky lg:top-32 h-fit space-y-6 glass-card p-8">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Finalize Order</h3>
         <button
            onClick={handleCheckout}
            disabled={loading || (paymentMethod === 'econt' && !econtData)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-5 rounded-2xl text-xl shadow-lg shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
          >
            {loading ? 'Processing...' : 'Complete Order'}
          </button>
          
          {(paymentMethod === 'econt' && !econtData) && (
            <p className="text-amber-500 text-sm text-center font-medium bg-amber-50 p-3 rounded-lg border border-amber-200">
              Please select a delivery address in the Econt map above to continue.
            </p>
          )}
      </div>
    </div>
  );
}
