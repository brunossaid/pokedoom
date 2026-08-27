import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Menu from './components/Menu';
import Home from './pages/Home';
import Pokedex from './pages/Pokedex';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import PokemonDetail from './pages/PokemonDetail';

function App() {
  return (
    <div className="app-container">
      <Header />

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokemon/:name" element={<PokemonDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<History />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Menu />
      </main>
    </div>
  );
}

export default App;
