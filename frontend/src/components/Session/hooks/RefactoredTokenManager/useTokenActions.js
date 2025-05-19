import { useCallback } from "react";

export const useTokenActions = ({
  tokens,
  setTokens,
  emitTokenUpdate,
  setContextMenu,
  hasControl,
}) => {
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

      console.log("[useTokenActions] Right-click on token", { token });

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

  const handleTokenAction = useCallback(
    (action, tokenId, arg) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token || !hasControl(token)) return;

      setContextMenu(null);

      console.log("[useTokenActions] Action triggered", {
        action,
        tokenId,
        arg,
      });

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
          console.warn("[useTokenActions] Unknown action:", action);
          return;
      }

      console.log("[useTokenActions] Updated tokens", updated);
      setTokens(updated);
      emitTokenUpdate(updated);
    },
    [tokens, hasControl, emitTokenUpdate, setTokens, setContextMenu]
  );

  return {
    handleTokenRightClick,
    handleTokenAction,
  };
};
