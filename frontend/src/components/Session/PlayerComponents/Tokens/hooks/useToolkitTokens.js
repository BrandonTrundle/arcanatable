import { useState, useCallback } from "react";

export const useToolkitTokens = (userToken) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/player-toolkit-tokens", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error("❌ Failed to fetch toolkit tokens:", err);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  const saveToken = async ({ name, imageUrl, size = "Medium" }) => {
    try {
      const res = await fetch("/api/player-toolkit-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ name, imageUrl, size }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const newToken = await res.json();
      setTokens((prev) => [...prev, newToken]);
      return { success: true };
    } catch (err) {
      console.error("❌ Save to toolkit failed:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteToken = async (id) => {
    try {
      const res = await fetch(`/api/player-toolkit-tokens/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setTokens((prev) => prev.filter((t) => t._id !== id));
      return { success: true };
    } catch (err) {
      console.error("❌ Delete error:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    tokens,
    loading,
    fetchTokens,
    saveToken,
    deleteToken,
  };
};
