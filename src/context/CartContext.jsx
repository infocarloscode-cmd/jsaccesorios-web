import { createContext, useContext, useEffect, useRef, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "js-accesorios-cart";
const DOT_SIZE = 36;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - DOT_SIZE / 2, y: r.top + r.height / 2 - DOT_SIZE / 2 };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [isCartOpen, setCartOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
  const cartIconRef = useRef(null);
  const flyKey = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, sourceEl) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    if (sourceEl && cartIconRef.current) {
      const key = flyKey.current++;
      setFlyingItems((prev) => [
        ...prev,
        { key, from: centerOf(sourceEl), to: centerOf(cartIconRef.current) },
      ]);
    }
  };

  const removeFlyingItem = (key) => {
    setFlyingItems((prev) => prev.filter((item) => item.key !== key));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setCartOpen,
        cartIconRef,
        flyingItems,
        removeFlyingItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
