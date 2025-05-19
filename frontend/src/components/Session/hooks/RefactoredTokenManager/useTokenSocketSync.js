import { useCallback } from "react";

export const useTokenSocketSync = ({ socket, isDM, mapId, campaignId }) => {
  const emitTokenUpdate = useCallback(
    (updatedTokens) => {
      console.log("[useTokenSocketSync] Attempting to emit token update", {
        mapId,
        campaignId,
        tokens: updatedTokens,
      });

      if (socket && isDM) {
        socket.emit("updateTokens", {
          campaignId,
          mapId,
          tokens: updatedTokens,
        });

        console.log("[useTokenSocketSync] Emitted updateTokens event");
      } else {
        console.warn(
          "[useTokenSocketSync] Skipped emit — socket missing or not DM"
        );
      }
    },
    [socket, isDM, mapId, campaignId]
  );

  return emitTokenUpdate;
};
