import { useState, useEffect, useCallback } from "react";

const sizeMultiplier = {
  Tiny: 0.5,
  Small: 1,
  Medium: 1,
  Large: 2,
  Huge: 3,
  Gargantuan: 4,
};

export const useTokenManager = ({ map, socket, isDM, user }) => {
  const [tokens, setTokens] = useState(map.content.placedTokens || []);
  const [contextMenu, setContextMenu] = useState(null);
  const [externalSelections, setExternalSelections] = useState({});

  const cellSize = 70;

  const hasControl = useCallback(
    (token) =>
      isDM || (user && token.controller && token.controller === user._id),
    [isDM, user]
  );

  useEffect(() => {
    if (!socket) return;

    const handleTokensUpdate = (payload) => {
      if (String(payload.mapId) === String(map._id)) {
        setTokens(payload.tokens || []);
      }
    };

    socket.on("tokensUpdated", handleTokensUpdate);
    return () => socket.off("tokensUpdated", handleTokensUpdate);
  }, [socket, map._id]);

  useEffect(() => {
    setTokens(map.content.placedTokens || []);
  }, [map._id]);

  const emitTokenUpdate = (updatedTokens) => {
    if (socket && isDM) {
      socket.emit("updateTokens", {
        campaignId: map.content?.campaign,
        mapId: map._id,
        tokens: updatedTokens,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleTokenDropped = ({ mapId, token }) => {
      if (String(mapId) !== String(map._id)) return;
      setTokens((prev) => [...prev, token]);
    };

    socket.on("tokenDropped", handleTokenDropped);
    return () => socket.off("tokenDropped", handleTokenDropped);
  }, [socket, map._id]);

  useEffect(() => {
    if (!socket) return;

    const handleTokenSelected = ({ mapId, tokenId, userId, username }) => {
      if (String(mapId) !== String(map._id)) return;
      if (user && user._id === userId) return;

      setExternalSelections((prev) => ({
        ...prev,
        [tokenId]: { userId, username },
      }));
    };

    socket.on("tokenSelected", handleTokenSelected);
    return () => socket.off("tokenSelected", handleTokenSelected);
  }, [socket, map._id, user]);

  useEffect(() => {
    if (!socket) return;

    const handleDeselection = ({ mapId, userId }) => {
      if (String(mapId) !== String(map._id)) return;

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
  }, [socket, map._id]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerMovedToken = ({ mapId, tokenId, x, y }) => {
      if (String(mapId) !== String(map._id)) return;

      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
      );
    };

    socket.on("playerMovedToken", handlePlayerMovedToken);
    return () => socket.off("playerMovedToken", handlePlayerMovedToken);
  }, [socket, map._id]);

  const handleTokenRightClick = (e, id, stageRef) => {
    const token = tokens.find((t) => t.id === id);
    if (!token || !hasControl(token)) return;

    e.evt.preventDefault();

    const stage = stageRef.current.getStage();
    const scale = stage.scaleX();
    const pos = stage.position();
    const screenX = token.x * scale + pos.x;
    const screenY = token.y * scale + pos.y;

    setContextMenu({
      tokenId: id,
      x: screenX,
      y: screenY,
      currentSize: token.tokenSize || "Medium",
      mode: null,
    });
  };

  const handleTokenAction = (action, tokenId, arg) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token || !hasControl(token)) return;
    setContextMenu(null);

    let updated;

    switch (action) {
      case "delete":
        updated = tokens.filter((t) => t.id !== tokenId);
        break;
      case "to-dm":
      case "to-player":
        updated = tokens.map((t) =>
          t.id === tokenId
            ? { ...t, layer: action === "to-dm" ? "dm" : "player" }
            : t
        );
        break;
      case "number":
        const baseName = prompt("Base name (e.g., Goblin):");
        const count =
          tokens.filter((t) => t.title?.startsWith(baseName)).length + 1;
        updated = tokens.map((t) =>
          t.id === tokenId ? { ...t, title: `${baseName} ${count}` } : t
        );
        break;
      case "resize":
        setContextMenu((prev) => ({ ...prev, tokenId, mode: "resize" }));
        return;
      case "apply-resize":
        updated = tokens.map((t) =>
          t.id === tokenId ? { ...t, tokenSize: arg } : t
        );
        break;
      default:
        return;
    }

    setTokens(updated);
    emitTokenUpdate(updated);
  };

  const handleDrop = (e, stageRef) => {
    e.preventDefault();
    const stage = stageRef.current?.getStage();
    if (!stage) return;

    const scale = stage.scaleX();
    const stageBox = stage.container().getBoundingClientRect();
    const pointerX = e.clientX - stageBox.left;
    const pointerY = e.clientY - stageBox.top;

    try {
      const raw = e.dataTransfer.getData("application/json");
      const data = JSON.parse(raw);

      const tokenSize = data.tokenSize || "Medium";
      const sizeMult = sizeMultiplier[tokenSize] || 1;
      const offset = (cellSize * sizeMult) / 2;

      const x = (pointerX - stage.x()) / scale - offset;
      const y = (pointerY - stage.y()) / scale - offset;

      const newToken = {
        id: `${data.id}-${Date.now()}`,
        x,
        y,
        imageUrl: data.imageUrl || "",
        title: data.name || "Unnamed",
        tokenSize,
        layer: data.layer || "dm",
        controller: !isDM && user ? user._id : null,
      };

      const updated = [...tokens, newToken];
      setTokens(updated);

      if (isDM) {
        emitTokenUpdate(updated);
      } else if (socket) {
        socket.emit("tokenDrop", {
          campaignId: map.content?.campaign,
          mapId: map._id,
          token: newToken,
        });
      }
    } catch (err) {
      console.error("❌ Failed to parse dropped token:", err);
    }
  };

  return {
    tokens,
    setTokens,
    contextMenu,
    setContextMenu,
    handleDrop,
    handleTokenRightClick,
    handleTokenAction,
    emitTokenUpdate,
    hasControl,
    cellSize,
    externalSelections,
  };
};
