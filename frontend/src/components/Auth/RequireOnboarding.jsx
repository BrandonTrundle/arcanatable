import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const RequireOnboarding = ({ children }) => {
  const { user } = useContext(UserContext);

  if (localStorage.getItem('token') && user === null) {
    return <p>Loading...</p>;
  }

  if (!user?.token) return <Navigate to="/" />;
  if (!user?.onboardingComplete) return <Navigate to="/user-onboarding" />;

  return children;
};

export default RequireOnboarding;
