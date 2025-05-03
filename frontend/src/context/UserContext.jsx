import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import defaultAvatar from '../assets/defaultav.png'; // ✅ Import fallback

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const userData = {
          ...res.data,
          token,
          avatarUrl: res.data.avatarUrl || defaultAvatar, // ✅ Use fallback
        };
        setUser(userData);
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('token');
        setUser(null);
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
