import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieSection from '../components/MovieSection';
import BookingBanner from '../components/BookingBanner';
import MobileNavigation from '../components/MobileNavigation';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1d1d1d] text-white">
      <Header />
      <MobileNavigation />

      <main className="box-border min-w-0 w-full pt-[76px] pb-20 md:ml-56 md:w-[calc(100%-14rem)] md:pb-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <MovieSection />
          <BookingBanner />
        </div>
      </main>

      <div className="pb-20 md:pb-0 md:ml-56">
        <Footer />
      </div>
    </div>
  );
}