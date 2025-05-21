import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export function useAOEManager(initialAoes = []) {
  const [aoes, setAoes] = useState(initialAoes);

  const addAOE = useCallback((aoeData) => {
    const newAOE = {
      id: uuidv4(),
      type: "circle",
      anchored: false,
      x: 0,
      y: 0,
      sourceTokenId: null,
      color: "rgba(255,0,0,0.4)",
      visibleTo: "all",
      ...aoeData, // override defaults
    };

    setAoes((prev) => [...prev, newAOE]);
    return newAOE;
  }, []);

  const updateAOE = useCallback((id, updates) => {
    setAoes((prev) =>
      prev.map((aoe) => (aoe.id === id ? { ...aoe, ...updates } : aoe))
    );
  }, []);

  const removeAOE = useCallback((id) => {
    setAoes((prev) => prev.filter((aoe) => aoe.id !== id));
  }, []);

  return {
    aoes,
    addAOE,
    updateAOE,
    removeAOE,
  };
}
