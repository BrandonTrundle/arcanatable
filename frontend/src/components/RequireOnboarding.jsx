import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const RequireOnboarding = ({ children }) => {
  const { user } = useContext(UserContext);

  // Assume you fetched user with onboardingComplete previously
  // Otherwise fetch the user in a useEffect on app startup
  if (!user?.token) return <Navigate to="/" />;
  if (!user?.onboardingComplete) return <Navigate to="/user-onboarding" />;

  return children;
};

export default RequireOnboarding;
