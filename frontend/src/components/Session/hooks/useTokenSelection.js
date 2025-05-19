import { useState, useCallback } from "react";

export const useTokenSelection = (
  tokens,
  hasControl,
  emitSelection,
  emitDeselection,
  setFocusedToken // ✅ Add this
) => {
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const selectToken = useCallback(
    (id) => {
      //console.log("🧠 selectToken called with:", id);

      const token = tokens.find((t) => t.id === id);
      //console.log("🎯 Matching token object:", token);

      if (!token || !hasControl(token)) {
        console.warn("⛔ No token found or control denied.");
        return;
      }

      if (selectedTokenId && selectedTokenId !== id && emitDeselection) {
        emitDeselection();
      }

      setSelectedTokenId(id);
      setFocusedToken?.(token);

      if (emitSelection) {
        emitSelection(id);
      }
    },
    [
      tokens,
      hasControl,
      emitSelection,
      emitDeselection,
      selectedTokenId,
      setFocusedToken,
    ]
  );

  const clearSelection = useCallback(() => {
    if (selectedTokenId && emitDeselection) {
      emitDeselection();
    }
    setSelectedTokenId(null);
  }, [selectedTokenId, emitDeselection]);

  return {
    selectedTokenId,
    selectToken,
    clearSelection,
  };
};
