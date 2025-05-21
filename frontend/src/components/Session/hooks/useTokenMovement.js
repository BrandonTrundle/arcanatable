import { useCallback } from "react";
import { debounceTokenSave } from "../../../utils/debounceTokenSave";

export const useTokenMovement = ({
  map,
  tokens,
  setTokens,
  hasControl,
  socket,
  isDM,
  emitTokenUpdate,
  onTokenMove,
}) => {
  const handleTokenMove = useCallback(
    (id, x, y) => {
      const token = tokens.find((t) => t.id === id);
      if (!token || !hasControl(token)) return;

      const cellSize = 70; // 🔁 Match your current cell size
      const cellX = Math.floor(x / cellSize);
      const cellY = Math.floor(y / cellSize);
      const snappedX = cellX * cellSize + cellSize / 2;
      const snappedY = cellY * cellSize + cellSize / 2;

      const updated = tokens.map((t) =>
        t.id === id ? { ...t, x: snappedX, y: snappedY, cellX, cellY } : t
      );

      setTokens(updated);

      if (isDM) {
        emitTokenUpdate(updated);
        debounceTokenSave(map._id, {
          ...map.content,
          placedTokens: updated,
        });
      } else if (socket) {
        socket.emit("playerMovedToken", {
          campaignId: map.content?.campaign,
          mapId: map._id,
          tokenId: id,
          x: snappedX,
          y: snappedY,
          cellX,
          cellY,
        });
      }

      if (onTokenMove) onTokenMove(id, snappedX, snappedY);
    },
    [
      map,
      tokens,
      setTokens,
      hasControl,
      socket,
      isDM,
      emitTokenUpdate,
      onTokenMove,
    ]
  );

  return { handleTokenMove };
};
