import { createContext, useCallback, useContext, useRef, useState } from "react";

const CatalogUIContext = createContext(null);

export function CatalogUIProvider({ children }) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const openDetail = useCallback((product) => setDetailProduct(product), []);
  const closeDetail = useCallback(() => setDetailProduct(null), []);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <CatalogUIContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        detailProduct,
        openDetail,
        closeDetail,
        toast,
        showToast,
      }}
    >
      {children}
    </CatalogUIContext.Provider>
  );
}

export function useCatalogUI() {
  const ctx = useContext(CatalogUIContext);
  if (!ctx) throw new Error("useCatalogUI debe usarse dentro de <CatalogUIProvider>");
  return ctx;
}
