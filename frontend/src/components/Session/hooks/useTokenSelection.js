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
      const token = tokens.find((t) => t.id === id);

      if (!token) {
        console.warn("⛔ No token found.");
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
    [tokens, emitSelection, emitDeselection, selectedTokenId, setFocusedToken]
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
