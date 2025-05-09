import { useState, useCallback } from "react";

export const useTokenSelection = (
  tokens,
  hasControl,
  emitSelection,
  emitDeselection
) => {
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const selectToken = useCallback(
    (id) => {
      const token = tokens.find((t) => t.id === id);
      if (!token || !hasControl(token)) return;

      // 🔥 Emit deselection if switching
      if (selectedTokenId && selectedTokenId !== id && emitDeselection) {
        emitDeselection();
      }

      setSelectedTokenId(id);

      if (emitSelection) {
        emitSelection(id);
      }
    },
    [tokens, hasControl, emitSelection, emitDeselection, selectedTokenId]
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
