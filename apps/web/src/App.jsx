import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import CookieNotice from './components/CookieNotice.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const RoomsPage = lazy(() => import('./pages/RoomsPage.jsx'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage.jsx'));
const CafePage = lazy(() => import('./pages/CafePage.jsx'));
const WellnessPage = lazy(() => import('./pages/WellnessPage.jsx'));
const GardenBookingPage = lazy(() => import('./pages/GardenBookingPage.jsx'));
const BalconyBookingPage = lazy(() => import('./pages/BalconyBookingPage.jsx'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.jsx'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));

const RouteFallback = () => (
  <div className="min-h-screen bg-background w-full">
    <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" aria-label="Loading page" />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <CookieNotice />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/restaurant" element={<RestaurantPage />} />
          <Route path="/cafe" element={<CafePage />} />
          <Route path="/wellness" element={<WellnessPage />} />
          <Route path="/garden" element={<GardenBookingPage />} />
          <Route path="/garden-booking" element={<GardenBookingPage />} />
          <Route path="/balcony-booking" element={<BalconyBookingPage />} />
          <Route path="/balcony" element={<BalconyBookingPage />} /> {/* Alias for link ease */}
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-background w-full">
              <div className="text-center">
                <h1 className="heading-font text-4xl font-bold text-foreground mb-4">Page not found</h1>
                <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-primary font-medium hover:underline">Back to Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
