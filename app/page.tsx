'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

// Helper to generate 50 deterministic products
const generateProducts = () => {
  const products = [];
  const names = [
    'BPC-157', 'TB-500', 'CJC-1295', 'Ipamorelin', 'Melanotan II', 
    'PT-141', 'GHK-Cu', 'AOD-9604', 'Tesamorelin', 'MOTS-c',
    'SS-31', 'Epitalon', 'DSIP', 'Selank', 'Semax',
    'Tirzepatide', 'Retatrutide', 'Sermorelin', 'Hexarelin', 'GHRP-2',
    'GHRP-6', 'IGF-1 LR3', 'IGF-1 DES', 'PEG-MGF', 'Follistatin 344',
    'Bimagrumab', 'Kisspeptin-10', 'Dihexa', 'Cerebrolysin', 'ARA-290',
    'VIP', 'KPV', 'LL-37', 'B7-33', 'Thymalin',
    'Thymosin Alpha-1', 'GDF-8', 'Myostatin Propeptide', 'Orexin-A', 'Cortexin',
    'Pinealon', 'Vilon', 'Endoluten', 'Cerluten', 'Sigumir',
    'Vladonix', 'Svetinorm', 'Ventfort', 'Chelohart', 'Suprefort'
  ];

  for (let i = 0; i < 50; i++) {
    const r = ((i * 15) % 150).toString(16).padStart(2, '0');
    const g = ((100 + i * 20) % 200 + 55).toString(16).padStart(2, '0');
    const b = ((i * 30) % 150).toString(16).padStart(2, '0');
    const hexColor = `${r}${g}${b}`;

    products.push({
      id: `pep-${i}`,
      name: names[i] || `Peptide Variant ${i}`,
      price: 25 + (i * 2.5),
      description: `Premium research grade ${names[i] || `peptide ${i}`}. Highly purified for scientific analysis.`,
      image: `https://placehold.co/600x600/${hexColor}/ffffff?text=${encodeURIComponent(names[i] || `PEP-${i}`)}`,
      totalWeight: 0.1
    });
  }
  return products;
};

const products = generateProducts();

export default function Home() {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000); 
  };

  return (
    <div className="space-y-16 pb-20 pt-6 md:pt-10">
      {/* Hero Section */}
      <section className="text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 md:mb-6 text-slate-900 tracking-tight">
          Next-Gen <span className="text-gradient">Recovery.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
          Premium research peptides engineered for maximum purity. Experience the pinnacle of modern bioscience.
        </p>
      </section>

      {/* Tailwind Responsive Bento Box Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-auto">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="glass-card overflow-hidden group flex flex-col relative w-full min-h-[300px]"
          >
            {/* Image Section */}
            <div className="relative flex-1 overflow-hidden min-h-[160px] md:min-h-[200px]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent opacity-90" />
            </div>
            
            {/* Content Section */}
            <div className="p-4 md:p-6 relative z-10 bg-white/90 backdrop-blur-md flex flex-col justify-end shadow-[0_-10px_20px_rgba(255,255,255,0.9)]">
              <h2 className="text-lg md:text-xl font-bold mb-1 text-slate-800 line-clamp-1">{product.name}</h2>
              <p className="text-slate-500 text-xs md:text-sm mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex justify-between items-center mt-auto">
                <span className="text-lg md:text-xl font-extrabold text-emerald-600">€{product.price.toFixed(2)}</span>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className={`relative overflow-hidden text-sm md:text-base font-medium py-1.5 md:py-2 px-4 md:px-5 rounded-full transition-all duration-300 ${
                    addedId === product.id 
                      ? 'bg-emerald-600 text-white shadow-lg scale-95'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm'
                  }`}
                >
                  {addedId === product.id ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
