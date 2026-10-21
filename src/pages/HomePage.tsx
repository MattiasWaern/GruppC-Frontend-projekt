import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieSection from '../components/MovieSection';
import BookingBanner from '../components/BookingBanner';
import MobileNavigation from '../components/MobileNavigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1d1d1d] text-white">
      <Header />
      <MobileNavigation />

<main className="box-border min-w-0 pt-20 pb-20 md:ml-56 md:pb-0">
  <HeroSection />
  <MovieSection />
  <BookingBanner />
</main>
    </div>
  );
}