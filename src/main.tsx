import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './style.css';
import { BASE_PATH } from './paths';
const root = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <BrowserRouter basename={BASE_PATH}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
if (root.hasChildNodes() && root.dataset.page !== '404') hydrateRoot(root, app);
else createRoot(root).render(app);
