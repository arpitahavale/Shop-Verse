import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import ShimmerFallback from './ShimmerFallback';
import ToastStack from './common/ToastStack';
import PageTransition from './common/PageTransition';
import AiConcierge from './AiConcierge';

function Layout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Suspense fallback={<ShimmerFallback />}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <ToastStack />
      <AiConcierge />
    </div>
  );
}

export default Layout;
