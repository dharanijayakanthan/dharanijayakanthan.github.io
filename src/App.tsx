import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
// import { Home } from './pages/Home';
// import { Work } from './pages/Work';
// import { Lab } from './pages/Lab';
// import Products from './pages/Products';
import { Jobs } from './pages/Jobs';
import { HabitTracker } from './pages/HabitTracker';
import { ExpenseTracker } from './pages/ExpenseTracker';
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
  const isHabitRoute = location.pathname.startsWith('/habits');
  const isExpenseRoute = location.pathname.startsWith('/expense-tracker');

  if (isHabitRoute) {
    return (
      <>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/habits" element={<HabitTracker />} />
          </Routes>
        </AnimatePresence>
      </>
    );
  }

  if (isExpenseRoute) {
    return (
      <>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/expense-tracker" element={<ExpenseTracker />} />
          </Routes>
        </AnimatePresence>
      </>
    );
  }

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

import { Analytics } from "@vercel/analytics/react"

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Analytics />
    </BrowserRouter>
  )
}
