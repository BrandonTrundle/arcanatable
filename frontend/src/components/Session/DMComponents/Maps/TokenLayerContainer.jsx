import React from "react";
import TokenLayerWrapper from "./TokenLayerWrapper";

const TokenLayerContainer = ({
  tokens,
  stageRef,
  handleTokenMove,
  handleTokenDrag,
  handleTokenRightClick,
  handleMapClick,
  selectToken,
  activeInteractionMode,
  activeLayer,
  hasControl,
  selectedTokenId,
  externalSelections,
  isCombatMode,
  showTokenInfo,
}) => {
  return (
    <TokenLayerWrapper
      tokens={tokens}
      allTokens={tokens}
      stageRef={stageRef}
      handleTokenMove={handleTokenMove}
      handleTokenDrag={handleTokenDrag}
      handleTokenRightClick={handleTokenRightClick}
      handleMapClick={handleMapClick}
      selectToken={selectToken}
      activeInteractionMode={activeInteractionMode}
      activeLayer={activeLayer}
      hasControl={hasControl}
      selectedTokenId={selectedTokenId}
      externalSelections={externalSelections}
      isCombatMode={isCombatMode}
      showTokenInfo={showTokenInfo}
    />
  );
};

export default TokenLayerContainer;
