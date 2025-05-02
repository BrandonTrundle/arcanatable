import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import UserOnboarding from './pages/UserOnboarding';
import PrivateRoute from './components/Auth/PrivateRoute';
import RequireOnboarding from './components/Auth/RequireOnboarding';
import MessagePage from './pages/Messages/MessagePage';

function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [location, navigate]);

  return null;
}

const App = () => (
<Router>
  <TokenHandler />
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route path="/user-onboarding" element={
      <PrivateRoute>
        <UserOnboarding />
      </PrivateRoute>
    } />

    <Route path="/dashboard" element={
      <PrivateRoute>
        <RequireOnboarding>
          <Dashboard />
        </RequireOnboarding>
      </PrivateRoute>
    } />

    <Route path="/messages" element={
      <PrivateRoute>
        <RequireOnboarding>
          <MessagePage />
        </RequireOnboarding>
      </PrivateRoute>
    } />
  </Routes>
</Router>
);

export default App;
