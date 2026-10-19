import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'sg_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  // keep the cart when the page is refreshed
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (product) =>
    setItems((prev) => {
      const found = prev.find((i) => i.barcode === product.barcode);
      if (found) {
        return prev.map((i) =>
          i.barcode === product.barcode ? { ...i, qty: Math.min(i.qty + 1, product.stock) } : i
        );
      }
      return [
        ...prev,
        {
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          stock: product.stock,
          qty: 1,
        },
      ];
    });

  // qty <= 0 removes the item; qty is capped at available stock
  const setQty = (barcode, qty) =>
    setItems((prev) =>
      prev
        .map((i) => (i.barcode === barcode ? { ...i, qty: Math.min(qty, i.stock) } : i))
        .filter((i) => i.qty > 0)
    );

  const remove = (barcode) => setItems((prev) => prev.filter((i) => i.barcode !== barcode));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      remove,
      clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
