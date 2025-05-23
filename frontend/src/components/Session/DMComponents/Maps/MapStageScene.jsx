import React from "react";
import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";
import MapBackground from "./MapBackground";
import AoELayer from "../../AoE/AoELayer";
import MeasurementRender from "./MeasurementRender";
import TokenLayerContainer from "./TokenLayerContainer";

const MapStageScene = ({
  map,
  gridWidth,
  gridHeight,
  cellSize,
  stageRef,
  imageUrl,
  activeInteractionMode,
  handleMouseDown,
  handleMouseMove,
  handleMapClick,
  selectedTokenId,
  selectedToken,
  measureTarget,
  measurementColor,
  emitMeasurement,
  aoes,
  internalSelectedTokenId,
  tokens,
  removeAOE,
  selectedShape,
  shapeSettings,
  isDraggingAoE,
  aoeDragOrigin,
  aoeDragTarget,
  snapMode,
  handleTokenMove,
  handleTokenDrag,
  handleTokenRightClick,
  selectToken,
  activeLayer,
  hasControl,
  externalSelections,
  isCombatMode,
  showTokenInfo,
  lockedMeasurements,
  remoteMeasurements,
  setMeasureTarget,
}) => {
  return (
    <ZoomableStage
      ref={stageRef}
      width={gridWidth}
      height={gridHeight}
      onMouseMove={(e) => {
        if (
          activeInteractionMode === "measure" &&
          selectedTokenId &&
          selectedToken
        ) {
          const stage = stageRef.current;
          const pointer = stage.getPointerPosition();

          if (pointer) {
            const transform = stage.getAbsoluteTransform().copy().invert();
            const stagePoint = transform.point(pointer);

            setMeasureTarget(stagePoint); // 👈 This is what was missing
            emitMeasurement(stagePoint);
            handleMouseMove(e);
          }
        } else {
          handleMouseMove(e);
        }
      }}
      onClick={handleMapClick}
      onMouseDown={handleMouseDown}
      activeInteractionMode={activeInteractionMode}
    >
      <MapBackground
        imageUrl={imageUrl}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        cellSize={cellSize}
        mapWidth={map?.content?.width}
        mapHeight={map?.content?.height}
        onMapClick={handleMapClick}
        onMouseDown={handleMouseDown}
      />

      <AoELayer
        aoes={aoes}
        selectedTokenId={internalSelectedTokenId}
        activeInteractionMode={activeInteractionMode}
        getTokenById={(id) => tokens.find((t) => t.id === id)}
        selectedShape={selectedShape}
        isDraggingAoE={isDraggingAoE}
        aoeDragOrigin={aoeDragOrigin}
        aoeDragTarget={aoeDragTarget}
        onAoERightClick={(aoe) => removeAOE(aoe.id)}
        shapeSettings={shapeSettings}
        cellSize={cellSize}
      />

      <MeasurementRender
        activeInteractionMode={activeInteractionMode}
        selectedToken={selectedToken}
        selectedTokenId={selectedTokenId}
        measureTarget={measureTarget}
        measurementColor={measurementColor}
        lockedMeasurements={lockedMeasurements}
        remoteMeasurements={remoteMeasurements}
        cellSize={cellSize}
      />

      <TokenLayerContainer
        tokens={tokens}
        stageRef={stageRef}
        handleTokenMove={handleTokenMove}
        handleTokenDrag={handleTokenDrag}
        handleTokenRightClick={handleTokenRightClick}
        handleMapClick={handleMapClick}
        selectToken={selectToken}
        activeInteractionMode={activeInteractionMode}
        activeLayer={activeLayer}
        hasControl={hasControl}
        selectedTokenId={internalSelectedTokenId}
        externalSelections={externalSelections}
        isCombatMode={isCombatMode}
        showTokenInfo={showTokenInfo}
      />
    </ZoomableStage>
  );
};

export default MapStageScene;
