import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';

interface ItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onConfirm: (customizedItem: any) => void;
}

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm
}) => {
  const [selectedVariant, setSelectedVariant] = useState<{name: string, price: number} | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<{name: string, price: number}[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [customAddonName, setCustomAddonName] = useState('');
  const [customAddonPrice, setCustomAddonPrice] = useState('');

  // Reset state when a new item is selected
  useEffect(() => {
    if (item && isOpen) {
      if (item.variants && item.variants.length > 0) {
        // Automatically select the first variant by default
        setSelectedVariant(item.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setSelectedAddons([]);
      setQuantity(1);
      setCustomAddonName('');
      setCustomAddonPrice('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const toggleAddon = (addon: {name: string, price: number}) => {
    setSelectedAddons(prev => {
      // Find exact match by name AND price so custom ones can coexist
      const existsIndex = prev.findIndex(a => a.name === addon.name && a.price === addon.price);
      if (existsIndex >= 0) {
        return prev.filter((_, i) => i !== existsIndex);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddCustom = () => {
    if (!customAddonName.trim()) return;
    const price = Number(customAddonPrice) || 0;
    setSelectedAddons(prev => [...prev, { name: customAddonName.trim(), price }]);
    setCustomAddonName('');
    setCustomAddonPrice('');
  };

  const calculateUnitPrice = () => {
    const basePrice = selectedVariant ? selectedVariant.price : item.price;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addonsTotal;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const customizedItem = {
      itemId: item.id || (item as any)._id,
      name: item.name,
      category: item.category,
      price: unitPrice, // Adjusted unit price
      quantity: quantity,
      variant: selectedVariant || undefined,
      addons: selectedAddons.length > 0 ? selectedAddons : undefined
    };
    onConfirm(customizedItem);
    onClose();
  };

  const hasVariants = item.variants && item.variants.length > 0;
  const hasAddons = item.addons && item.addons.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
            <div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.category}
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">{item.name}</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">Base Price: ₹{item.price}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Variants Section */}
            {hasVariants && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Select Variant</h3>
                  <span className="text-[10px] font-bold text-brand-accent uppercase bg-brand-accent/10 px-2 py-1 rounded">Required</span>
                </div>
                <div className="space-y-2">
                  {item.variants!.map((variant, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedVariant?.name === variant.name 
                          ? 'border-brand-accent bg-brand-accent/5' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedVariant?.name === variant.name ? 'border-brand-accent' : 'border-slate-300'
                        }`}>
                          {selectedVariant?.name === variant.name && <div className="w-2.5 h-2.5 bg-brand-accent rounded-full" />}
                        </div>
                        <span className="font-semibold text-slate-700">{variant.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">₹{variant.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addons Section */}
            {hasAddons && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Add-ons</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Optional</span>
                </div>
                <div className="space-y-2">
                  {item.addons!.map((addon, idx) => {
                    const isSelected = selectedAddons.some(a => a.name === addon.name);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-success bg-brand-success/5' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-brand-success bg-brand-success' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className="font-semibold text-slate-700">{addon.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 font-mono">+₹{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Request Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Custom Modifier</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Extra Spicy, Open Charge..." 
                  value={customAddonName}
                  onChange={(e) => setCustomAddonName(e.target.value)}
                  className="flex-[2] p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-accent text-sm" 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                />
                <input 
                  type="number" 
                  placeholder="Price (₹)" 
                  value={customAddonPrice}
                  onChange={(e) => setCustomAddonPrice(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-accent text-sm" 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                />
                <button 
                  onClick={handleAddCustom}
                  className="px-4 py-3 bg-brand-accent text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-primary transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Quantity</h3>
               <div className="flex items-center bg-slate-100 rounded-xl p-1">
                 <button 
                   onClick={() => setQuantity(q => Math.max(1, q - 1))}
                   className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-slate-600 shadow-sm hover:text-slate-900"
                 >
                   <Minus size={18} />
                 </button>
                 <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
                 <button 
                   onClick={() => setQuantity(q => q + 1)}
                   className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-slate-600 shadow-sm hover:text-slate-900"
                 >
                   <Plus size={18} />
                 </button>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Item Total</span>
              <span className="text-2xl font-bold text-brand-primary font-mono">₹{totalPrice}</span>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full bg-brand-accent text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-brand-accent/30 hover:shadow-brand-accent/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Add to Order <Plus size={18} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
