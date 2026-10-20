import Header from './components/Header'
import HeroSection from './components/HeroSection'
import MovieSection from './components/MovieSection'
import BookingBanner from './components/BookingBanner'
import MobileNavigation from './components/MobileNavigation'


export default function App() {
  return (
    <div className='min-h-screen bg-[#1d1d1d] text-[#e5ca7a]'>
      <Header />
      <main className='mx-auto max-w-7x1 px-4 pb-24 md:px-8 md:pb-12'>
        <HeroSection />
        <MovieSection />
        <BookingBanner />
      </main>

      <footer className='border-t border-[#806b36] px-4 py-6 text-center text-sm text-gray-400'>
        <p>© 2026 Filmvisarna</p>
         <p className="mt-2">Upplev film tillsammans.</p>
      </footer>

       <MobileNavigation />
    </div>
  )
}
