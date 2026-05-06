// UrbanGuard-AI React entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Global axios interceptor — auto-attach JWT Bearer token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbanguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
