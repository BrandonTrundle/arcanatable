import { useCallback } from "react";
import throttle from "lodash.throttle";

export const useEmitMeasurement = ({
  broadcastEnabled,
  socket,
  mapId,
  userId,
  selectedToken,
  selectedTokenId,
}) => {
  return useCallback(
    throttle((to) => {
      if (
        broadcastEnabled &&
        socket &&
        mapId &&
        selectedTokenId &&
        selectedToken
      ) {
        socket.emit("measurement:update", {
          mapId,
          userId,
          tokenId: selectedTokenId,
          from: { x: selectedToken.x, y: selectedToken.y },
          to,
        });
      }
    }, 100),
    [broadcastEnabled, socket, mapId, userId, selectedTokenId, selectedToken]
  );
};
