import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nearkart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [shopInfo, setShopInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('nearkart_cart_shop');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('nearkart_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('nearkart_cart_shop', JSON.stringify(shopInfo));
  }, [shopInfo]);

  function addItem(product, shop) {
    if (shopInfo && shopInfo.id !== shop.id) {
      if (!window.confirm(`Your cart has items from "${shopInfo.name}". Clear cart and add items from "${shop.name}"?`)) {
        return;
      }
      setItems([]);
    }

    setShopInfo({ id: shop.id, name: shop.name, upi_id: shop.upi_id, whatsapp_number: shop.whatsapp_number, phone: shop.phone });

    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        toast.success(`Updated ${product.name} quantity`);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`Added ${product.name} to cart! 🛒`);
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        unit: product.unit,
        quantity: 1,
      }];
    });
  }

  function removeItem(productId) {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      if (updated.length === 0) {
        setShopInfo(null);
      }
      return updated;
    });
    toast.success('Item removed');
  }

  function updateQuantity(productId, quantity) {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  }

  function clearCart() {
    setItems([]);
    setShopInfo(null);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items,
    shopInfo,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
