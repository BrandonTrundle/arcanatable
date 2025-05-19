import React, { useEffect, useMemo, useCallback } from "react";
import useImage from "use-image";
import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";

import MapBackground from "./MapBackground";
import AoELayer from "./AoELayer";
import TokenLayerWrapper from "./TokenLayerWrapper";
import MapUIOverlays from "./MapUIOverlays";

import { useStageContext } from "../../hooks/useStageContext";
import { useOutsideClickHandler } from "../../hooks/useOutsideClickHandler";
import { useTokenManager } from "../../hooks/useTokenManager";
import { useTokenSelection } from "../../hooks/useTokenSelection";
import { useAoEManager } from "../../hooks/useAoEManager";
import { useTokenMovement } from "../../hooks/useTokenMovement";
import { useDropHandler } from "../../hooks/useDropHandler";
import { useSelectionSync } from "../../hooks/useSelectionSync";
import { emitSelection, emitDeselection } from "../../hooks/useTokenEmitters";

const RefactoredMap = ({
  map,
  activeLayer = "dm",
  onTokenMove,
  isDM = false,
  selectedTokenId,
  setSelectedTokenId,
  socket,
  user,
  activeInteractionMode,
  setActiveInteractionMode,
  setExternalTokens,
  isCombatMode,
  setFocusedToken,
  useRolledHP = false, // default false
}) => {
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(
    map || {}
  );
  const [image] = useImage(map?.content?.imageUrl || "");

  const {
    tokens,
    setTokens,
    contextMenu,
    setContextMenu,
    handleDrop,
    handleTokenRightClick,
    handleTokenAction,
    emitTokenUpdate,
    hasControl,
    externalSelections,
  } = useTokenManager({ map, socket, isDM, user, useRolledHP });

  const {
    selectedTokenId: internalSelectedTokenId,
    selectToken,
    clearSelection: internalClearSelection,
  } = useTokenSelection(
    tokens,
    hasControl,
    (id) => emitSelection(socket, map, user, id),
    () => emitDeselection(socket, map, user),
    setFocusedToken // ✅ This is new
  );

  const { clearSelection } = useSelectionSync({
    internalSelectedTokenId,
    internalClearSelection,
    setSelectedTokenId,
    map,
    user,
    socket,
  });

  const {
    aoeDraft,
    aoeShapes,
    showAoEToolbox,
    mousePosition,
    handleMouseMove,
    handleMapClick,
    confirmAoE,
    removeAoE,
  } = useAoEManager(
    activeInteractionMode,
    cellSize,
    setActiveInteractionMode,
    socket,
    map?._id,
    map?.content?.campaign,
    stageRef
  );

  const { handleTokenMove: rawHandleTokenMove } = useTokenMovement({
    map,
    tokens,
    setTokens,
    hasControl,
    socket,
    isDM,
    emitTokenUpdate,
    onTokenMove,
  });

  const handleTokenMove = useCallback(
    (...args) => rawHandleTokenMove(...args),
    [rawHandleTokenMove]
  );

  const { onDrop, onDragOver } = useDropHandler(handleDrop, stageRef);
  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

  // ✅ Now do the rendering guard here
  if (!map || !map._id || !map.content) {
    return null;
  }

  return (
    <div className="map-rendered-view" onDrop={onDrop} onDragOver={onDragOver}>
      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onMouseMove={(e) => handleMouseMove(e)}
      >
        <MapBackground
          imageUrl={map.content.imageUrl}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          cellSize={cellSize}
          mapWidth={map.content.width}
          mapHeight={map.content.height}
          onMapClick={handleMapClick}
        />

        <AoELayer
          aoeShapes={aoeShapes}
          aoeDraft={aoeDraft}
          mapId={map._id}
          mousePosition={mousePosition}
          removeAoE={removeAoE}
        />

        <TokenLayerWrapper
          tokens={tokens}
          stageRef={stageRef}
          handleTokenMove={handleTokenMove}
          handleTokenRightClick={handleTokenRightClick}
          handleMapClick={handleMapClick}
          selectToken={selectToken}
          activeInteractionMode={activeInteractionMode}
          activeLayer={activeLayer}
          hasControl={hasControl}
          selectedTokenId={internalSelectedTokenId}
          externalSelections={externalSelections}
          isCombatMode={isCombatMode}
        />
      </ZoomableStage>

      <MapUIOverlays
        isDM={isDM}
        contextMenu={contextMenu}
        handleTokenAction={handleTokenAction}
        closeContextMenu={() => setContextMenu(null)}
        showAoEToolbox={showAoEToolbox}
        confirmAoE={confirmAoE}
      />
    </div>
  );
};

export default RefactoredMap;
