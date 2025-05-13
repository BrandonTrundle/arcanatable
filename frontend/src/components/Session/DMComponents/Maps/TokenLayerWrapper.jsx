import React from "react";
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
}) => {
  const filteredTokens =
    activeLayer === "dm"
      ? tokens
      : tokens.filter((t) => t.layer === activeLayer);

  return (
    <Layer>
      <TokenLayer
        isInteractive={activeInteractionMode !== "aoe"}
        tokens={filteredTokens}
        onDragEnd={handleTokenMove}
        onRightClick={(e, id) => {
          console.log("🖱️ Token right-clicked:", id);
          handleTokenRightClick(e, id, stageRef);
        }}
        onClick={(e, id) => {
          console.log("🖱️ Token clicked in mode:", activeInteractionMode);
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

          console.log("📌 Redirecting token click to AoE placement");
          handleMapClick({
            stage,
            pointerPos,
            trueX,
            trueY,
            originalEvent: e,
          });
        }}
        selectedTokenId={selectedTokenId}
        activeLayer={activeLayer}
        canMove={(token) =>
          activeInteractionMode === "select" &&
          hasControl(token) &&
          selectedTokenId === token.id
        }
        externalSelections={externalSelections}
      />
    </Layer>
  );
};

export default TokenLayerWrapper;
