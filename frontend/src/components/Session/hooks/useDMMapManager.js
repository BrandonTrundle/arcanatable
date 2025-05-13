import { useEffect, useState, useCallback } from "react";

const useDMMapManager = (sessionMap, socket, user) => {
  const [activeMap, setActiveMap] = useState(sessionMap || null);
  const [tokens, setTokens] = useState([]);

  // Sync initial map on prop change
  useEffect(() => {
    if (sessionMap) {
      setActiveMap(sessionMap);
    }
  }, [sessionMap]);

  // Register user with socket
  useEffect(() => {
    if (user && socket) {
      socket.emit("registerUser", user._id);
    }
  }, [socket, user]);

  // Listen for map load from server
  useEffect(() => {
    const handler = (map) => setActiveMap(map);
    socket.on("loadMap", handler);
    return () => socket.off("loadMap", handler);
  }, [socket]);

  const saveCurrentMap = useCallback(async () => {
    if (!activeMap || !activeMap._id) return;
    try {
      const res = await fetch(`/api/dmtoolkit/${activeMap._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            ...activeMap.content,
            placedTokens: tokens,
          },
        }),
      });

      if (!res.ok) {
        console.error("❌ Failed to save map state.");
      } else {
        console.log("✅ Map state saved.");
      }
    } catch (err) {
      console.error("🚫 Error while saving map:", err);
    }
  }, [activeMap, tokens]);

  // Warn before unload
  useEffect(() => {
    const handler = (e) => {
      if (typeof saveCurrentMap === "function") {
        saveCurrentMap();
      }
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveCurrentMap]);

  return {
    activeMap,
    setActiveMap,
    tokens,
    setTokens,
    saveCurrentMap,
  };
};

export default useDMMapManager;
