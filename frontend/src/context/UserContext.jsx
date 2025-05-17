import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import defaultAvatar from "../assets/defaultav.png";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const userData = {
            ...res.data,
            token,
            avatarUrl: res.data.avatarUrl || defaultAvatar,
          };
          setUser(userData);
        })
        .catch((err) => {
          console.error("Failed to fetch user:", err);
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    let start = Date.now();

    const savePlayedTime = () => {
      const end = Date.now();
      const msPlayed = end - start;
      const hours = msPlayed / (1000 * 60 * 60); // ms to hours

      const token = localStorage.getItem("token");
      if (!token || hours <= 0) return;

      fetch(`${import.meta.env.VITE_API_URL}/api/users/add-playtime`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hours }),
      }).catch((err) => console.error("[HoursPlayed] Failed to send:", err));

      start = Date.now(); // reset timer
    };

    const interval = setInterval(savePlayedTime, 5 * 60 * 1000); // every 5 mins
    window.addEventListener("beforeunload", savePlayedTime);

    return () => {
      clearInterval(interval);
      savePlayedTime();
      window.removeEventListener("beforeunload", savePlayedTime);
    };
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Add this helper to fix your error
export const useUserContext = () => useContext(UserContext);
