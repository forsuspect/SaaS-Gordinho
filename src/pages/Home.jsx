import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Promotions from '../components/Promotions';
import MenuSection from '../components/MenuSection';
import CustomBurgerBuilder from '../components/CustomBurgerBuilder';
import About from '../components/About';
import Reviews from '../components/Reviews';
import WelcomeDiscountModal from '../components/WelcomeDiscountModal';
import StoreLocations from '../components/StoreLocations';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const alreadySeen = localStorage.getItem('gb_welcome_seen');
    if (!alreadySeen) setShowWelcome(true);
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleScrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      const offset = 80;
      const elementPosition = menuSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <Navbar />

      <WelcomeDiscountModal
        open={showWelcome}
        onClose={() => {
          localStorage.setItem('gb_welcome_seen', '1');
          setShowWelcome(false);
        }}
      />
      
      {/* Landing page components */}
      <Hero onOrderNowClick={handleScrollToMenu} />
      
      <Promotions onProductClick={handleProductSelect} />
      
      <MenuSection onProductClick={handleProductSelect} />
      
      <CustomBurgerBuilder />
      
      <About />
      
      <Reviews />

      <StoreLocations />

      <Footer />

      {/* Side shopping cart drawer */}
      <CartDrawer />

      {/* Product customization modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}
