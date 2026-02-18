import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
// import { Home } from './pages/Home';
// import { Work } from './pages/Work';
// import { Lab } from './pages/Lab';
// import Products from './pages/Products';
import { Jobs } from './pages/Jobs';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  return (
    <Layout>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/work" element={<Work />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/products" element={<Products />} /> */}
          <Route path="/" element={<Jobs />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
