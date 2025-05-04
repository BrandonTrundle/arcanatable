import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // Wait for context to hydrate
  if (localStorage.getItem('token') && user === null) {
    return <p>Loading...</p>; // Or a fancy loader
  }

  if (!user?.token) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
