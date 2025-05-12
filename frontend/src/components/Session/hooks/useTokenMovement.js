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
  const handleTokenMove = (id, x, y) => {
    const token = tokens.find((t) => t.id === id);
    if (!token || !hasControl(token)) return;

    const updated = tokens.map((t) => (t.id === id ? { ...t, x, y } : t));

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
        x,
        y,
      });
    }

    if (onTokenMove) onTokenMove(id, x, y);
  };

  return { handleTokenMove };
};
