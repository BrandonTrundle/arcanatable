// src/hooks/useCharacters.js
import { useState, useEffect } from "react";

export const useCharacters = (campaignId, userToken) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const data = await res.json();
      const filtered = data.filter((char) => char.campaign === campaignId);
      setCharacters(filtered);
    } catch (err) {
      console.error("❌ Failed to load characters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId && userToken) {
      fetchCharacters();
    }
  }, [campaignId, userToken]);

  return { characters, loading, fetchCharacters };
};
