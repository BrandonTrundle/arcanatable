import { useCallback } from "react";

export const useMapInteractionHandlers = ({
  rawHandleTokenMove,
  aoes,
  updateAOE,
  isDM,
  socket,
  mapId,
  cellSize,
  setTokens,
  lockMeasurement,
  broadcastEnabled,
  selectedToken,
  selectedTokenId,
  measureTarget,
  measurementColor,
  user,
  setLockedMeasurements,
  setMeasureTarget,
  activeInteractionMode,
}) => {
  const handleTokenMove = useCallback(
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

  const handleTokenDrag = useCallback(
    (id, x, y) => {
      setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
    },
    [setTokens]
  );

  const handleMapClick = useCallback(
    (e) => {
      if (activeInteractionMode !== "measure") return;

      if (
        lockMeasurement &&
        broadcastEnabled &&
        selectedToken &&
        selectedTokenId &&
        measureTarget
      ) {
        const locked = {
          userId: user._id,
          from: { x: selectedToken.x, y: selectedToken.y },
          to: measureTarget,
          color: measurementColor,
        };

        socket.emit("measurement:lock", {
          mapId,
          ...locked,
        });

        setLockedMeasurements((prev) => [...prev, locked]);
      }

      setMeasureTarget(null);
    },
    [
      activeInteractionMode,
      lockMeasurement,
      broadcastEnabled,
      selectedToken,
      selectedTokenId,
      measureTarget,
      measurementColor,
      socket,
      mapId,
      user?._id,
      setLockedMeasurements,
      setMeasureTarget,
    ]
  );

  return {
    handleTokenMove,
    handleTokenDrag,
    handleMapClick,
  };
};
