import { useState, useEffect, useCallback } from "react";

let saveTimeout = null;

const debounceTokenSave = (mapId, content) => {
  if (!mapId || !content) return;

  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit/${mapId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }).catch((err) => {
      console.error("❌ Debounced token save failed:", err);
    });
  }, 1000);
};

const sizeMultiplier = {
  Tiny: 0.5,
  Small: 1,
  Medium: 1,
  Large: 2,
  Huge: 3,
  Gargantuan: 4,
};

export const useTokenManager = ({
  map,
  socket,
  isDM,
  user,
  useRolledHP = false, // ✅ include this
}) => {
  const [tokens, setTokens] = useState(() => map?.content?.placedTokens || []);
  const [contextMenu, setContextMenu] = useState(null);
  const [externalSelections, setExternalSelections] = useState({});
  const [tokenTemplates, setTokenTemplates] = useState([]);

  const mapId = map?._id ?? null;
  const campaignId = map?.content?.campaign ?? null;
  const cellSize = 70;

  const hasControl = useCallback(
    (token) =>
      isDM || (user && token.controller && token.controller === user._id),
    [isDM, user]
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [allTokensRes, npcsRes, monstersRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_URL}/api/dmtoolkit/type/AllTokens`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          ),
          fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit/type/NPC`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit/type/Monster`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const [allTokens, npcs, monsters] = await Promise.all([
          allTokensRes.json(),
          npcsRes.json(),
          monstersRes.json(),
        ]);

        // Flatten and store them by ID for fast lookup
        const combined = [...npcs, ...monsters, ...allTokens].map((entry) => ({
          id: entry._id,
          type: entry.type || "custom",
          content: entry.content || {},
          title: entry.title || entry.content?.name || "Unnamed",
        }));

        setTokenTemplates(combined);
      } catch (err) {
        console.error("❌ Failed to load token templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    setTokens(map?.content?.placedTokens || []);
  }, [mapId]);

  const emitTokenUpdate = (updatedTokens) => {
    if (socket && isDM) {
      socket.emit("updateTokens", {
        campaignId,
        mapId,
        tokens: updatedTokens,
      });
    }
  };

  useEffect(() => {
    if (!socket || !mapId) return;

    const handleTokensUpdate = (payload) => {
      if (String(payload.mapId) === String(mapId)) {
        setTokens(payload.tokens || []);
      }
    };

    socket.on("tokensUpdated", handleTokensUpdate);
    return () => socket.off("tokensUpdated", handleTokensUpdate);
  }, [socket, mapId]);

  useEffect(() => {
    if (!socket || !map?._id || isDM) return;

    const handleTokensUpdated = (payload) => {
      const { mapId, tokens: receivedTokens } = payload;

      if (mapId === map._id) {
        console.log("📥 Player received tokensUpdated:", receivedTokens);
        setTokens(receivedTokens);
        console.log("✅ Player setTokens updated:", receivedTokens);
      }
    };

    socket.on("tokensUpdated", handleTokensUpdated);

    return () => {
      socket.off("tokensUpdated", handleTokensUpdated);
    };
  }, [socket, map?._id, isDM]);

  useEffect(() => {
    if (!socket || !mapId) return;

    const handleTokenDropped = ({ mapId: incomingId, token }) => {
      if (String(incomingId) !== String(mapId)) return;

      setTokens((prev) => {
        const updated = [...prev, token];

        if (isDM) {
          debounceTokenSave(mapId, {
            ...(map?.content || {}),
            placedTokens: updated,
          });
        }

        return updated;
      });
    };

    socket.on("tokenDropped", handleTokenDropped);
    return () => socket.off("tokenDropped", handleTokenDropped);
  }, [socket, mapId, isDM, map?.content]);

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

    const handlePlayerMovedToken = ({ mapId: incomingId, tokenId, x, y }) => {
      if (String(incomingId) !== String(mapId)) return;

      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
      );
    };

    socket.on("playerMovedToken", handlePlayerMovedToken);
    return () => socket.off("playerMovedToken", handlePlayerMovedToken);
  }, [socket, mapId]);

  const handleTokenRightClick = useCallback(
    (e, id, stageRef) => {
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
    },
    [tokens, hasControl, setContextMenu]
  );

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

  function generateUniqueTokenName(baseName, existingTokens) {
    const nameRegex = new RegExp(`^${baseName}(?: (\\d+))?$`, "i");
    let maxNumber = 0;

    existingTokens.forEach((token) => {
      const match = token.name.match(nameRegex);
      if (match) {
        const number = match[1] ? parseInt(match[1], 10) : 0;
        if (number >= maxNumber) {
          maxNumber = number + 1;
        }
      }
    });

    return maxNumber > 0 ? `${baseName} ${maxNumber}` : baseName;
  }

  const handleDrop = async ({ trueX, trueY, originalEvent }) => {
    try {
      const rawData =
        originalEvent?.nativeEvent?.dataTransfer?.getData("application/json");
      if (!rawData) {
        console.warn("⚠️ No token payload found in dataTransfer.");
        return;
      }

      const dragged = JSON.parse(rawData);
      const templateId = dragged.id;
      if (!templateId) return;

      const template = tokenTemplates?.find?.((t) => t.id === templateId);
      const isCharacterDrop = !template && dragged.layer === "player";

      let base = {};
      let baseName = "Unknown";
      let imageUrl = dragged.imageUrl;
      let size = dragged.tokenSize || "Medium";
      let sourceType = "custom";
      let maxHP = 10;

      if (template) {
        base = template.content || {};
        baseName = template.title || base.name || "Unknown";
        imageUrl =
          base.image || base.avatar || base.imageUrl || dragged.imageUrl;
        size = base.tokenSize || "Medium";
        sourceType = template.type || "custom";

        if (useRolledHP && base.hitDice && isValidDiceString(base.hitDice)) {
          maxHP = rollDiceFormula(base.hitDice);
        } else if (!isNaN(Number(base.hitPoints))) {
          maxHP = Number(base.hitPoints);
        }
      } else if (isCharacterDrop) {
        base = dragged;
        baseName = dragged.name || "Unnamed Hero";
        imageUrl = dragged.imageUrl;
        size = dragged.tokenSize || "Medium";
        sourceType = "character";
        maxHP = dragged.maxhp || 10;
      } else {
        console.warn("⚠️ Token template not found for:", templateId);
        return;
      }

      const uniqueName = generateUniqueTokenName(baseName, tokens);
      const uniqueId = `${templateId}_${Date.now()}`;

      const newToken = {
        id: uniqueId,
        name: uniqueName,
        originalName: baseName,
        baseTemplateId: templateId,
        imageUrl,
        tokenSize: size,
        x: trueX,
        y: trueY,
        layer: dragged.layer || "player", // ✅ Default to player layer
        sourceType,
        maxHP,
        currentHP: maxHP,
        initiative: null,
        conditions: [],
        notes: "",
      };

      setTokens((prev) => {
        const updatedTokens = [...prev, newToken];
        emitTokenUpdate(updatedTokens);
        return updatedTokens;
      });
    } catch (err) {
      console.error("❌ Error handling token drop:", err);
    }
  };

  // 🎲 Dice utilities
  function rollDiceFormula(formula) {
    const match = formula.match(/(\d+)d(\d+)(\s*\+\s*(\d+))?/);
    if (!match) return 0;

    const [, num, sides, , bonus] = match.map(Number);
    let total = 0;
    for (let i = 0; i < num; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total + (bonus || 0);
  }

  function isValidDiceString(str) {
    return /^\d+d\d+(\s*\+\s*\d+)?$/.test(str);
  }

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
