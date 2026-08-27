import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/modals.css';
import './styles/favorites.css';
import './styles/history.css';
import './styles/contact.css';
import './styles/features.css';
import './styles/detail.css';
import './styles/home.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
