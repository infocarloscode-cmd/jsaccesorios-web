import { CartProvider } from "./context/CartContext";
import { CatalogUIProvider } from "./context/CatalogUIContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import About from "./components/About";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProductModal from "./components/ProductModal";
import FlyToCartLayer from "./components/FlyToCartLayer";
import Toast from "./components/Toast";
import BackToTop from "./components/BackToTop";

export default function PublicSite() {
  return (
    <CartProvider>
      <CatalogUIProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Hero />
            <Catalog />
            <About />
          </main>
          <Footer />
          <CartDrawer />
          <ProductModal />
          <BackToTop />
          <FlyToCartLayer />
          <Toast />
        </div>
      </CatalogUIProvider>
    </CartProvider>
  );
}
