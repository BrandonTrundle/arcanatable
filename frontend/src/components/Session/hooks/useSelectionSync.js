import { useEffect, useCallback } from "react";
import { emitDeselection } from "./useTokenEmitters";

// Hook handles selection sync and ESC key clearing
export const useSelectionSync = ({
  internalSelectedTokenId,
  internalClearSelection,
  setSelectedTokenId,
  map,
  user,
  socket,
}) => {
  // External selection sync (to DMView)
  useEffect(() => {
    if (typeof setSelectedTokenId === "function") {
      setSelectedTokenId(internalSelectedTokenId);
    }
  }, [internalSelectedTokenId, setSelectedTokenId]);

  // ESC key to clear selection
  const clearSelection = useCallback(() => {
    internalClearSelection();
    emitDeselection(socket, map, user);
  }, [internalClearSelection, socket, map, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  return { clearSelection };
};
