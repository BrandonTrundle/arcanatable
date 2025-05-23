import { useEffect, useCallback } from "react";
import { useTokenManager } from "../../../hooks/useTokenManager";
import { useTokenSelection } from "../../../hooks/useTokenSelection";
import { useTokenMovement } from "../../../hooks/useTokenMovement";
import { useSelectionSync } from "../../../hooks/useSelectionSync";
import {
  emitSelection,
  emitDeselection,
} from "../../../hooks/useTokenEmitters";

export const useTokenInteraction = ({
  map,
  socket,
  isDM,
  user,
  useRolledHP,
  combatState,
  selectedTokenId,
  setSelectedTokenId,
  setFocusedToken,
  onTokenMove,
  setExternalTokens,
  aoes,
  updateAOE,
  cellSize,
}) => {
  const {
    tokens,
    setTokens,
    contextMenu,
    setContextMenu,
    handleDrop,
    handleTokenRightClick,
    handleTokenAction,
    emitTokenUpdate,
    hasControl,
    externalSelections,
  } = useTokenManager({ map, socket, isDM, user, useRolledHP, combatState });

  const {
    selectedTokenId: internalSelectedTokenId,
    selectToken,
    clearSelection: internalClearSelection,
  } = useTokenSelection(
    tokens,
    hasControl,
    (id) => emitSelection(socket, map, user, id),
    () => emitDeselection(socket, map, user),
    setFocusedToken
  );

  useSelectionSync({
    internalSelectedTokenId,
    internalClearSelection,
    setSelectedTokenId,
    map,
    user,
    socket,
  });

  const { handleTokenMove: rawHandleTokenMove } = useTokenMovement({
    map,
    tokens,
    setTokens,
    hasControl,
    socket,
    isDM,
    emitTokenUpdate,
    onTokenMove,
  });

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

      if (!isDM && socket && map?._id) {
        socket.emit("playerMovedToken", { mapId: map._id, tokenId: id, x, y });
      }
    },
    [rawHandleTokenMove, aoes, cellSize, isDM, map?._id, socket, updateAOE]
  );

  const handleTokenDrag = useCallback(
    (id, x, y) => {
      setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
    },
    [setTokens]
  );

  useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

  return {
    tokens,
    setTokens,
    contextMenu,
    setContextMenu,
    handleDrop,
    handleTokenRightClick,
    handleTokenAction,
    hasControl,
    externalSelections,
    handleTokenMove,
    handleTokenDrag,
    internalSelectedTokenId,
    selectToken,
  };
};
