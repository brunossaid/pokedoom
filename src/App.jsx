import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Menu from './components/Menu';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import { LoadingState } from './components/AsyncState';
import Home from './pages/Home';

const Pokedex = lazy(() => import('./pages/Pokedex'));
const Favorites = lazy(() => import('./pages/Favorites'));
const History = lazy(() => import('./pages/History'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'));

function App() {
  return (
    <div className="app-container">
      {/* Informa cambios de conexión sin bloquear la navegación ni el contenido cacheado. */}
      <OfflineBanner />
      <Header />

      <main className="content">
        <Suspense fallback={<LoadingState label="Loading page" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/pokemon/:name" element={<PokemonDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <Menu />
      </main>

      <Footer />
    </div>
  );
}

export default App;
