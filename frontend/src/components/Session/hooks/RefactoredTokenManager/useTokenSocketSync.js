import { useCallback } from "react";

export const useTokenSocketSync = ({
  socket,
  isDM,
  mapId,
  campaignId,
  combatState,
}) => {
  const emitTokenUpdate = useCallback(
    (updatedTokens) => {
      if (!socket || !isDM) {
        console.warn(
          "[useTokenSocketSync] Skipped emit — socket missing or not DM"
        );
        return;
      }

      const mergedTokens = updatedTokens.map((token) => {
        const combatant = combatState?.combatants?.find(
          (c) => c.tokenId === token.id
        );
        return {
          ...token,
          currentHP: combatant?.currentHP ?? token.currentHP,
          maxHP: combatant?.maxHP ?? token.maxHP,
        };
      });

      socket.emit("updateTokens", {
        campaignId,
        mapId,
        tokens: mergedTokens,
      });
    },
    [socket, isDM, mapId, campaignId, combatState]
  );

  return emitTokenUpdate;
};
