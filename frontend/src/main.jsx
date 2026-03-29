import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import AuthPage from './AuthPage';
import PublicAgentChat from './views/PublicAgentChat';

function Root() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aria_user')); } catch { return null; }
  });

  const handleAuth = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem('aria_token');
    localStorage.removeItem('aria_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - no auth needed */}
        <Route path="/agent/:token" element={<PublicAgentChat />} />
        {/* Auth routes */}
        <Route path="/*" element={
          user
            ? <App user={user} onLogout={handleLogout} />
            : <AuthPage onAuth={handleAuth} />
        } />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
);
