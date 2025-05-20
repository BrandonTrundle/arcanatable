import { useState, useEffect, useRef } from "react";
import { useDebouncedTokenSave } from "./RefactoredTokenManager/useDebouncedTokenSave";
import { useTokenTemplates } from "./RefactoredTokenManager/useTokenTemplates";
import { useTokenSocketSync } from "./RefactoredTokenManager/useTokenSocketSync";
import { useTokenPermission } from "./RefactoredTokenManager/useTokenPermission";
import { useTokenActions } from "./RefactoredTokenManager/useTokenActions";
import { useTokenDropHandler } from "./RefactoredTokenManager/useTokenDropHandler";

import { useTokenZIndexManager } from "./RefactoredTokenManager/useTokenZIndexManager";
import { useSelectedTokens } from "./RefactoredTokenManager/useSelectedTokens";
import { useTokenLockManager } from "./RefactoredTokenManager/useTokenLockManager";
import { useTokenSync } from "./RefactoredTokenManager/useTokenSync";
import { useCameraFollow } from "./RefactoredTokenManager/useCameraFollow";

const CELL_SIZE = 70;

export const useTokenManager = ({
  map,
  socket,
  isDM,
  user,
  useRolledHP = false,
}) => {
  const mapId = map?._id ?? null;
  const campaignId = map?.content?.campaign ?? null;

  const [tokens, setTokens] = useState(() => map?.content?.placedTokens || []);
  const [contextMenu, setContextMenu] = useState(null);
  const [externalSelections, setExternalSelections] = useState({});
  const skipEmitRef = useRef(false);

  // Modular hooks
  const debounceTokenSave = useDebouncedTokenSave();
  const tokenTemplates = useTokenTemplates(user);
  const emitTokenUpdate = useTokenSocketSync({
    socket,
    isDM,
    mapId,
    campaignId,
  });
  const hasControl = useTokenPermission(user, isDM);
  const { bringTokenToFront } = useTokenZIndexManager(tokens, setTokens);
  const {
    selectedTokens,
    toggleSelectedToken,
    clearSelectedTokens,
    isTokenSelected,
  } = useSelectedTokens();
  const { lockedTokens, toggleTokenLock, isTokenLocked } =
    useTokenLockManager();
  const { handleTokenUpdate, handleTokenDelete } = useTokenSync({
    onTokenUpdate: emitTokenUpdate,
    onTokenDelete: emitTokenUpdate,
  });
  const { cameraFollow, toggleCameraFollow } = useCameraFollow();

  // External behaviors
  const { handleTokenRightClick, handleTokenAction } = useTokenActions({
    tokens,
    setTokens,
    emitTokenUpdate,
    setContextMenu,
    hasControl,
  });

  const handleDrop = useTokenDropHandler({
    tokenTemplates,
    tokens,
    setTokens,
    emitTokenUpdate,
    useRolledHP,
    isDM, // ✅ ADD THIS
    socket, // ✅ And add socket too, if not already included inside the hook
    map, // ✅ Required for map._id
  });

  // Map changes
  useEffect(() => {
    setTokens(map?.content?.placedTokens || []);
  }, [mapId]);

  // Socket events
  useEffect(() => {
    if (!socket || !mapId) return;

    const handleTokensUpdate = (payload) => {
      if (String(payload.mapId) === String(mapId)) {
        setTokens(payload.tokens || []);
        // console.log(
        //   "[useTokenManager] Tokens updated from socket",
        //   payload.tokens
        // );
      }
    };

    socket.on("tokensUpdated", handleTokensUpdate);
    return () => socket.off("tokensUpdated", handleTokensUpdate);
  }, [socket, mapId]);

  useEffect(() => {
    // console.log("🧪 [useTokenManager] DM listener setup?", {
    //    socketExists: !!socket,
    //   mapId,
    //   isDM,
    //  });
    if (!socket || !map?._id || isDM) return;

    const handleTokensUpdated = (payload) => {
      const { mapId, tokens: receivedTokens } = payload;
      if (mapId === map._id) {
        setTokens(receivedTokens);
        console.log(
          "[useTokenManager] Player setTokens updated",
          receivedTokens
        );
      }
    };

    socket.on("tokensUpdated", handleTokensUpdated);
    return () => socket.off("tokensUpdated", handleTokensUpdated);
  }, [socket, map?._id, isDM]);

  useEffect(() => {
    if (!socket || !mapId || !isDM) return;

    const handlePlayerDroppedToken = ({ mapId: incomingId, token }) => {
      if (String(incomingId) !== String(mapId)) return;

      console.log(
        "📥 [useTokenManager] DM received playerDroppedToken:",
        token
      );

      setTokens((prev) => {
        const updated = [...prev, token];

        // Save token to DB immediately (optional but useful)
        debounceTokenSave(mapId, {
          ...(map?.content || {}),
          placedTokens: updated,
        });

        return updated;
      });
    };

    socket.on("playerDroppedToken", handlePlayerDroppedToken);

    return () => {
      socket.off("playerDroppedToken", handlePlayerDroppedToken);
    };
  }, [socket, mapId, isDM, map?.content]);

  useEffect(() => {
    if (!socket || !mapId) return;

    const handleTokenDropped = ({ mapId: incomingId, token }) => {
      if (String(incomingId) !== String(mapId)) return;

      const updated = [...tokens, token];
      setTokens(updated);

      if (isDM) {
        debounceTokenSave(mapId, {
          ...(map?.content || {}),
          placedTokens: updated,
        });
      }

      console.log("[useTokenManager] Token dropped", token);
    };

    socket.on("tokenDropped", handleTokenDropped);
    return () => socket.off("tokenDropped", handleTokenDropped);
  }, [socket, mapId, isDM, map?.content, tokens]);

  useEffect(() => {
    if (!socket || !mapId) return;

    const handleTokenSelected = ({
      mapId: incomingId,
      tokenId,
      userId,
      username,
    }) => {
      if (String(incomingId) !== String(mapId)) return;
      if (user && user._id === userId) return;

      setExternalSelections((prev) => ({
        ...prev,
        [tokenId]: { userId, username },
      }));
    };

    socket.on("tokenSelected", handleTokenSelected);
    return () => socket.off("tokenSelected", handleTokenSelected);
  }, [socket, mapId, user]);

  useEffect(() => {
    if (!socket || !mapId) return;

    const handleDeselection = ({ mapId: incomingId, userId }) => {
      if (String(incomingId) !== String(mapId)) return;

      setExternalSelections((prev) => {
        const updated = { ...prev };
        for (const tokenId in updated) {
          if (updated[tokenId].userId === userId) {
            delete updated[tokenId];
          }
        }
        return updated;
      });
    };

    socket.on("tokenDeselected", handleDeselection);
    return () => socket.off("tokenDeselected", handleDeselection);
  }, [socket, mapId]);

  useEffect(() => {
    if (!socket || !mapId) return;

    const handlePlayerMovedToken = ({
      mapId: incomingId,
      tokenId,
      x,
      y,
      tokenData,
    }) => {
      if (String(incomingId) !== String(mapId)) return;

      setTokens((prev) => {
        const exists = prev.some((t) => t.id === tokenId);
        return exists
          ? prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
          : [...prev, { id: tokenId, x, y, ...tokenData }];
      });

      console.log("[useTokenManager] Player moved token", {
        tokenId,
        x,
        y,
      });
    };

    socket.on("playerMovedToken", handlePlayerMovedToken);
    return () => socket.off("playerMovedToken", handlePlayerMovedToken);
  }, [socket, mapId]);

  return {
    tokens,
    setTokens,
    contextMenu,
    setContextMenu,
    handleTokenRightClick,
    handleTokenAction,
    emitTokenUpdate,
    hasControl,
    cellSize: CELL_SIZE,
    externalSelections,
    tokenTemplates,
    handleDrop,

    bringTokenToFront,
    selectedTokens,
    toggleSelectedToken,
    clearSelectedTokens,
    isTokenSelected,
    lockedTokens,
    toggleTokenLock,
    isTokenLocked,
    handleTokenUpdate,
    handleTokenDelete,
    cameraFollow,
    toggleCameraFollow,
  };
};
