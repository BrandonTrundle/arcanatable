import React, { memo, useCallback, useMemo } from "react";
import { Layer } from "react-konva";
import TokenLayer from "../../../DMToolkit/Maps/TokenLayer";

const TokenLayerWrapper = ({
  tokens,
  allTokens,
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

  const stableOnRightClick = useCallback(
    (e, id) => {
      handleTokenRightClick(e, id, stageRef);
    },
    [handleTokenRightClick, stageRef]
  );

  const stableOnClick = useCallback(
    (e, id) => {
      //     console.log("🖱️ Token clicked:", {
      //       id,
      //        activeInteractionMode,
      //     });
      selectToken(id);
    },
    [activeInteractionMode, selectToken]
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
      onDrag: handleTokenDrag,
      onRightClick: stableOnRightClick,
      onClick: stableOnClick,
      selectedTokenId,
      activeLayer,
      canMove: stableCanMove,
      externalSelections,
      showTokenInfo,
    }),
    [
      isCombatMode,
      filteredTokens,
      stableHandleTokenMove,
      handleTokenDrag,
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
