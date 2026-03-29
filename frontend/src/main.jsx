import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import App from './App';
import AuthPage from './AuthPage';
import PublicAgentChat from './views/PublicAgentChat';
import LandingPage from './views/LandingPage';

function Root() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aria_user')); } catch { return null; }
  });

  const handleAuth = (u) => {
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('aria_token');
    localStorage.removeItem('aria_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page at Root */}
        <Route path="/" element={<LandingPage />} />

        {/* Public route - no auth needed */}
        <Route path="/agent/:token" element={<PublicAgentChat />} />

        {/* Login Page */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <AuthPage onAuth={handleAuth} />
        } />

        {/* Dashboard - Protected */}
        <Route path="/dashboard/*" element={
          user
            ? <App user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />
        } />

        {/* Catch-all: Redirect to home or dashboard */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
);
