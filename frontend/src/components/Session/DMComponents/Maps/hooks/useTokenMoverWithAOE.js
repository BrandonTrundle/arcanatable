import { useCallback } from "react";

export const useTokenMoverWithAOE = ({
  rawHandleTokenMove,
  aoes,
  updateAOE,
  isDM,
  socket,
  mapId,
  cellSize,
}) => {
  return useCallback(
    (id, x, y) => {
      rawHandleTokenMove(id, x, y);

      aoes.forEach((aoe) => {
        if (aoe.anchorTokenId === id) {
          let snappedX, snappedY;

          if (aoe.type === "cone") {
            const baseX = Math.floor(x / cellSize) * cellSize;
            const baseY = Math.floor(y / cellSize) * cellSize;
            const offsetX = x % cellSize;
            const offsetY = y % cellSize;

            snappedX = baseX + (offsetX >= cellSize / 2 ? cellSize : 0);
            snappedY = baseY + (offsetY >= cellSize / 2 ? cellSize : 0);
          } else {
            snappedX = Math.floor(x / cellSize) * cellSize + cellSize / 2;
            snappedY = Math.floor(y / cellSize) * cellSize + cellSize / 2;
          }

          updateAOE(aoe.id, { x: snappedX, y: snappedY });
        }
      });

      if (!isDM && socket && mapId) {
        socket.emit("playerMovedToken", {
          mapId,
          tokenId: id,
          x,
          y,
        });
      }
    },
    [rawHandleTokenMove, aoes, updateAOE, isDM, socket, mapId, cellSize]
  );
};
