import Header from './components/Header'
import HeroSection from './components/HeroSection'
import MovieSection from './components/MovieSection'
import BookingBanner from './components/BookingBanner'
import MobileNavigation from './components/MobileNavigation'
import Footer from './components/Footer'


export default function App() {
  return (
    <div className='min-h-screen bg-[#1d1d1d] text-[#e5ca7a]'>
      <Header />
      <main className='mx-auto max-w-7x1 px-4 pb-24 md:px-8 md:pb-12'>
        <HeroSection />
        <MovieSection />
        <BookingBanner />
      </main>

      <footer> 
      <Footer />
      </footer>

       <MobileNavigation />
    </div>
  )
}
