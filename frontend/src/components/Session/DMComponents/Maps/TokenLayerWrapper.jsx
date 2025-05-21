import React, { memo, useCallback, useMemo, useRef, useEffect } from "react";
import { Layer } from "react-konva";
import TokenLayer from "../../../DMToolkit/Maps/TokenLayer";

const TokenLayerWrapper = ({
  tokens,
  allTokens,
  aoeDraft,
  stageRef,
  handleTokenMove,
  handleTokenRightClick,
  handleMapClick,
  selectToken,
  activeInteractionMode,
  activeLayer,
  hasControl,
  selectedTokenId,
  externalSelections,
  isCombatMode,
  handleTokenDrag,
  showTokenInfo,
}) => {
  const filteredTokens = Array.isArray(tokens)
    ? activeLayer === "dm"
      ? tokens
      : tokens.filter((t) => t.layer === activeLayer)
    : [];
  //console.log("🎯 TokenLayerWrapper tokens before filtering:", tokens);
  //console.log("🔍 Filtered tokens for layer:", activeLayer, filteredTokens);

  const stableOnRightClick = useCallback(
    (e, id) => {
      handleTokenRightClick(e, id, stageRef);
    },
    [handleTokenRightClick, stageRef]
  );

  const lastAoEInitRef = useRef(0);

  useEffect(() => {
    // Instead of checking aoeDraft directly, just log the timer
    if (aoeDraft && !aoeDraft.placed) {
      lastAoEInitRef.current = Date.now();
      console.log("⏱️ AoE draft initialized — click suppression timer started");
    }
  }, [aoeDraft]);

  const stableOnClick = useCallback(
    (e, id) => {
      const now = Date.now();

      // Suppress clicks that happen too soon after AoE draft init
      if (now - lastAoEInitRef.current < 200) {
        console.warn("⏳ Click suppressed — AoE still initializing");
        return;
      }

      // No longer checking aoeDraft here!
      if (activeInteractionMode !== "aoe") {
        console.log("🖱️ Token clicked in non-AoE mode:", {
          id,
          activeInteractionMode,
        });
        selectToken(id);
        return;
      }

      const token = allTokens.find((t) => t.id === id);
      if (!token) {
        console.warn("❌ Token not found for AoE placement:", id);
        return;
      }

      console.log("🎯 Token clicked for AoE placement:", {
        id,
        x: token.x,
        y: token.y,
      });

      handleMapClick({
        trueX: token.x,
        trueY: token.y,
      });
    },
    [activeInteractionMode, selectToken, handleMapClick, allTokens]
  );

  const stableCanMove = useCallback(
    (token) =>
      activeInteractionMode === "select" &&
      hasControl(token) &&
      selectedTokenId === token.id,
    [activeInteractionMode, hasControl, selectedTokenId]
  );

  const stableHandleTokenMove = useCallback(
    (...args) => handleTokenMove(...args),
    [handleTokenMove]
  );

  const tokenLayerProps = useMemo(
    () => ({
      isInteractive: true,
      isCombatMode,
      tokens: filteredTokens,
      onDragEnd: stableHandleTokenMove,
      onDrag: handleTokenDrag, // ✅ Add this line
      onRightClick: stableOnRightClick,
      onClick: stableOnClick,
      selectedTokenId,
      activeLayer,
      canMove: stableCanMove,
      externalSelections,
      showTokenInfo,
    }),
    [
      activeInteractionMode,
      isCombatMode,
      filteredTokens,
      stableHandleTokenMove,
      handleTokenDrag, // ✅ Include this in dependencies
      stableOnRightClick,
      stableOnClick,
      selectedTokenId,
      activeLayer,
      stableCanMove,
      externalSelections,
      showTokenInfo,
    ]
  );

  return (
    <Layer>
      <TokenLayer {...tokenLayerProps} />
    </Layer>
  );
};

export default memo(TokenLayerWrapper);
