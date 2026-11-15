import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Self-hosted fonts. The UI font (Cabinet Grotesk) loads from Fontshare in index.html.
import '@fontsource-variable/outfit';
import '@fontsource-variable/azeret-mono';

import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
