import React, { memo, useCallback, useMemo } from "react";
import { Layer } from "react-konva";
import TokenLayer from "../../../DMToolkit/Maps/TokenLayer";

const TokenLayerWrapper = ({
  tokens,
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

  const stableOnClick = useCallback(
    (e, id) => {
      if (activeInteractionMode !== "aoe") {
        selectToken(id);
        return;
      }

      const stage = stageRef.current?.getStage?.();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      const scale = stage.scaleX();
      const stagePos = stage.position();

      const trueX = (pointerPos.x - stagePos.x) / scale;
      const trueY = (pointerPos.y - stagePos.y) / scale;

      handleMapClick({
        stage,
        pointerPos,
        trueX,
        trueY,
        originalEvent: e,
      });
    },
    [activeInteractionMode, selectToken, stageRef, handleMapClick]
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
      isInteractive: activeInteractionMode !== "aoe",
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
