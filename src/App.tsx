import { BrowserRouter, Routes, Route } from 'react-router';

import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
import HeroSection from './components/HeroSection';
import MovieSection from './components/MovieSection';
import BookingBanner from './components/BookingBanner';
import Footer from './components/Footer';

import MovieDetails from './pages/detailPage';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingPage from './components/bookingSite';
import CancelBookingPage from './pages/CancelBookingPage';
import { MoviesPage } from './pages/MoviesPage';
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function HomePage() {
  return (
    <>
      <HeroSection />
      <MovieSection />
      <BookingBanner />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#1d1d1d] text-[#e5ca7a]">

        {/* Header ligger fixed överst */}
        <Header />

        {/* Navigation ligger fixed på vänster sida */}
        <MobileNavigation />

        {/* Gemensam yta för allt sidinnehåll */}
        <div className="min-w-0 md:ml-56">

          <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 pt-[76px] sm:px-6 md:px-8 md:pb-12">

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
              <Route path="/bookings/:viewingId" element={<BookingPage userId={1} />} />
              <Route path="/cancel-booking" element={<CancelBookingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>

          </main>

          <Footer />

        </div>
      </div>
    </BrowserRouter>
  );
}