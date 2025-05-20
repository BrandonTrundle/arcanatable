import React, { useEffect, useCallback, useRef } from "react";
import useImage from "use-image";
import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";

import MapBackground from "./MapBackground";
import AoELayer from "./AoELayer";
import TokenLayerWrapper from "./TokenLayerWrapper";
import MapUIOverlays from "./MapUIOverlays";
import HPDOMOverlay from "../../../DMToolkit/Maps/TokenLayerRefactor/visuals/HPDOMOverlay";

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
  useRolledHP = false,
  showTokenInfo,
  combatState,
}) => {
  // console.log("🧪 RefactoredMap isCombatMode:", isCombatMode);
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(
    map || {}
  );
  const containerRef = useRef();
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
    setFocusedToken
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
    (id, x, y) => {
      rawHandleTokenMove(id, x, y);

      if (!isDM && socket && map?._id) {
        socket.emit("playerMovedToken", {
          mapId: map._id,
          tokenId: id,
          x,
          y,
        });
      }
    },
    [rawHandleTokenMove, isDM, socket, map?._id]
  );

  const { onDrop, onDragOver } = useDropHandler(handleDrop, stageRef);
  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

  if (!map || !map._id || !map.content) {
    return null;
  }
  //console.log("🔁 combatState update:", combatState);
  const tokensWithHP = tokens.map((token) => {
    const combatant = combatState?.combatants?.find(
      (c) => c.tokenId === token.id
    );

    return {
      ...token,
      currentHP: combatant?.currentHP ?? token.currentHP,
      maxHP: combatant?.maxHP ?? token.maxHP,
    };
  });
  //console.log("🧪 isCombatMode:", isCombatMode, "tokensWithHP:", tokensWithHP);
  return (
    <div
      className="map-rendered-view"
      ref={containerRef}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ZoomableStage ref={stageRef} width={gridWidth} height={gridHeight}>
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
          showTokenInfo={showTokenInfo}
        />
      </ZoomableStage>

      <HPDOMOverlay
        tokens={tokensWithHP}
        containerRef={containerRef}
        stageRef={stageRef}
      />

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
