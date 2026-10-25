import { BrowserRouter, Routes, Route } from 'react-router'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import MovieSection from './components/MovieSection'
import BookingBanner from './components/BookingBanner'
import MobileNavigation from './components/MobileNavigation'
import MovieDetails from './pages/detaljsSida'
import Footer from './components/Footer'
import BookingConfirmation from './pages/BookingConfirmation'
import CancelBookingPage from './pages/CancelBookingPage'

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

        <Header />

        <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-20 md:px-8 md:pb-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/cancel-booking" element={<CancelBookingPage />} />
          </Routes>
        </main>

        <Footer />

        <MobileNavigation />

      </div>
    </BrowserRouter>
  );
}
