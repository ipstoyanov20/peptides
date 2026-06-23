'use client';

import React from "react";
import "./globals.css";
import { CartProvider, useCart } from "@/contexts/CartContext";
import Link from "next/link";

function Navbar() {
  const { items } = useCart();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="glass sticky top-0 z-50 py-3 px-4 md:py-4 md:px-6 mb-6 md:mb-8 flex justify-between items-center md:rounded-b-2xl mx-auto max-w-7xl w-full border-b md:border-b-0 border-slate-200">
      <div className="text-xl md:text-2xl font-extrabold text-emerald-600 tracking-tight shrink-0">
        <Link href="/">PEPTIDES.</Link>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <Link href="/checkout" className="flex items-center gap-1 md:gap-2 font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
          <span className="hidden sm:inline">Cart</span>
          <div className="bg-emerald-100 text-emerald-700 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full font-bold shadow-sm text-sm md:text-base">
            {totalItems}
          </div>
        </Link>
        <Link href="/checkout" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg shadow-emerald-500/30 transition-all font-medium text-sm md:text-base">
          Checkout
        </Link>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        
        <CartProvider>
          <Navbar />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
            {children}
          </main>
          
          <footer className="mt-20 md:mt-32 pb-12 pt-8 text-center text-slate-400 px-4">
            <p className="text-sm md:text-base">&copy; {new Date().getFullYear()} Peptides Store. All rights reserved.</p>
            <div className="mt-6 flex justify-center items-center gap-4">
              <img src="/econt-logo.png" alt="Econt Delivery" className="h-5 md:h-6 opacity-50 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
