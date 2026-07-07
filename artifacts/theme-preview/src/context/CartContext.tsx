import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../lib/shopify';
import { createCart } from '../lib/shopify';

export interface CartItem {
  id: string;
  productId: number;
  title: string;
  price: number;
  color: string;
  size: string;
  qty: number;
  bg: string;
  handle: string;
  imageUrl?: string;
  variantId?: string; // Shopify variant GID for checkout
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: string, size: string, qty?: number, variantId?: string) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  checkout: () => Promise<void>;
  checkoutLoading: boolean;
  checkoutError: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function addItem(product: Product, color: string, size: string, qty = 1, variantId?: string) {
    const id = `${product.id}-${color}-${size}`;
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, {
        id,
        productId: product.id,
        title: product.title,
        price: product.price,
        color,
        size,
        qty,
        bg: product.bg,
        handle: product.handle,
        imageUrl: product.imageUrl,
        variantId: variantId ?? product.variantId,
      }];
    });
    setIsOpen(true);
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function checkout() {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    // Separate items with real Shopify variant IDs from mock-only items
    const realItems = items.filter(
      item => item.variantId && !item.variantId.startsWith('mock'),
    );
    const mockItems = items.filter(
      item => !item.variantId || item.variantId.startsWith('mock'),
    );

    if (realItems.length === 0) {
      // All items are mock/demo products — no live Shopify variants available.
      // Surface this clearly rather than redirecting with an empty or broken cart.
      setCheckoutError(
        'These demo products are not yet available for purchase. ' +
        'Add real products from the store to check out.',
      );
      setCheckoutLoading(false);
      return;
    }

    if (mockItems.length > 0) {
      // Warn the user that some items cannot be checked out
      const mockTitles = mockItems.map(i => i.title).join(', ');
      setCheckoutError(
        `Note: "${mockTitles}" ${mockItems.length === 1 ? 'is a demo product and was' : 'are demo products and were'} removed from checkout.`,
      );
      // Don't return — continue checkout with the real items
    }

    const lines = realItems.map(item => ({
      merchandiseId: item.variantId!,
      quantity: item.qty,
    }));

    try {
      const cart = await createCart(lines);
      window.open(cart.checkoutUrl, '_blank');
    } catch (err) {
      setCheckoutError('Could not start checkout. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setCheckoutLoading(false);
    }
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, updateQty, removeItem,
      totalItems, subtotal,
      isOpen,
      openCart:  () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      checkout,
      checkoutLoading,
      checkoutError,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
