import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";

import Header from "./components/Header";
import MobileNavigation from "./components/MobileNavigation";
import HeroSection from "./components/HeroSection";
import MovieSection from "./components/MovieSection";
import BookingBanner from "./components/BookingBanner";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

import EventPage from './pages/eventPage'
import { EventDetailPage } from './pages/eventdetailPage'
import MovieDetails from "./pages/detailPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingPage from "./components/bookingSite";
import CancelBookingPage from "./pages/CancelBookingPage";
import ContactPage from "./pages/ContactPage";
import { MoviesPage } from "./pages/MoviesPage";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AboutUs from './pages/AboutUs';

import AdminDashboard from "./pages/admin/AdminDashboard";
import SnackPage from "./pages/SnackPage";

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
      <AuthProvider>
        <div className="min-h-screen bg-[#1d1d1d] text-[#e5ca7a]">
          {/* Header ligger fixed överst */}
          <Header />

          {/* Navigation ligger fixed på vänster sida */}
          <MobileNavigation />

          <CookieBanner />

          {/* Gemensam yta för allt sidinnehåll */}
          <div className="min-w-0 md:ml-56">
            <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 pt-[76px] sm:px-6 md:px-8 md:pb-12">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/bookings/:viewingId" element={<BookingPage />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />}/>
                <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
                <Route path="/cancel-booking" element={<CancelBookingPage />} />
                <Route path="/events" element={<EventPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profil" element={<ProfilePage />} />
                <Route path="/om-oss" element={<AboutUs />}/>
                <Route path="/kontakt" element={<ContactPage />} />
                <Route path="/snacks" element={<SnackPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
