import React, { useEffect, useRef, useCallback, useState } from "react";
import useImage from "use-image";
import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";

import MapBackground from "./MapBackground";
import TokenLayerWrapper from "./TokenLayerWrapper";
import MapUIOverlays from "./MapUIOverlays";
import HPDOMOverlay from "../../../DMToolkit/Maps/TokenLayerRefactor/visuals/HPDOMOverlay";

import { useStageContext } from "../../hooks/useStageContext";
import { useOutsideClickHandler } from "../../hooks/useOutsideClickHandler";
import { useTokenManager } from "../../hooks/useTokenManager";
import { useTokenSelection } from "../../hooks/useTokenSelection";
import { useTokenMovement } from "../../hooks/useTokenMovement";
import { useDropHandler } from "../../hooks/useDropHandler";
import { useSelectionSync } from "../../hooks/useSelectionSync";
import { emitSelection, emitDeselection } from "../../hooks/useTokenEmitters";

import AoELayer from "../../AoE/AoELayer";
import AoEControlPanel from "../../AoE/AoEControlPanel";
import { useAoEInteraction } from "../../AoE/hooks/useAoEInteraction";

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
  aoes = [],
  addAOE,
  removeAOE,
  updateAOE,
}) => {
  //console.log("updateAOE in RefactoredMap:", updateAOE);
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(
    map || {}
  );
  const containerRef = useRef();

  const [image] = useImage(map?.content?.imageUrl || "");
  const [snapMode, setSnapMode] = useState("center");

  const [shapeSettings, setShapeSettings] = useState({
    cone: { radius: 150, angle: 60, color: "#ff0000" },
    circle: { radius: 100, color: "#ff0000" },
    square: { width: 30, color: "#00ff00" }, // ✅ <-- MAKE SURE THIS EXISTS
    rectangle: { width: 40, height: 20, color: "#ff0000" },
    line: { width: 40, height: 5, color: "#ff0000" },
  });

  const {
    selectedShape,
    setSelectedShape,
    isAnchored,
    setIsAnchored,
    isDraggingAoE,
    aoeDragOrigin,
    aoeDragTarget,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useAoEInteraction({
    activeInteractionMode,
    setActiveInteractionMode,
    selectedTokenId,
    stageRef,
    addAOE,
    shapeSettings,
    cellSize,
    snapMode,
  });

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
  } = useTokenManager({ map, socket, isDM, user, useRolledHP, combatState });

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

      // Move any AoEs anchored to this token
      aoes.forEach((aoe) => {
        if (aoe.anchorTokenId === id) {
          let snappedX, snappedY;

          if (aoe.type === "cone") {
            // snap to corner
            const baseX = Math.floor(x / cellSize) * cellSize;
            const baseY = Math.floor(y / cellSize) * cellSize;
            const offsetX = x % cellSize;
            const offsetY = y % cellSize;

            snappedX = baseX + (offsetX >= cellSize / 2 ? cellSize : 0);
            snappedY = baseY + (offsetY >= cellSize / 2 ? cellSize : 0);
          } else {
            // snap to center
            snappedX = Math.floor(x / cellSize) * cellSize + cellSize / 2;
            snappedY = Math.floor(y / cellSize) * cellSize + cellSize / 2;
          }

          updateAOE(aoe.id, { x: snappedX, y: snappedY });
        }
      });
      if (!isDM && socket && map?._id) {
        socket.emit("playerMovedToken", {
          mapId: map._id,
          tokenId: id,
          x,
          y,
        });
      }
    },
    [rawHandleTokenMove, isDM, socket, map?._id, aoes, updateAOE]
  );

  const handleTokenDrag = useCallback(
    (id, x, y) => {
      setTokens((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, x, y } : t));
        return [...updated];
      });
    },
    [setTokens]
  );

  const { onDrop, onDragOver } = useDropHandler(handleDrop, stageRef);
  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

  const handleMapClick = useCallback(
    (e) => {
      if (activeInteractionMode === "aoe") return;
    },
    [activeInteractionMode]
  );

  if (!map || !map._id || !map.content) {
    return null;
  }

  const tokensWithHP = tokens
    .filter((token) => token.layer === "player")
    .map((token) => {
      const combatant = combatState?.combatants?.find(
        (c) => c.tokenId === token.id
      );

      return {
        ...token,
        currentHP: combatant?.currentHP ?? token.currentHP,
        maxHP: combatant?.maxHP ?? token.maxHP,
      };
    });

  return (
    <div
      className="map-rendered-view"
      ref={containerRef}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {activeInteractionMode === "aoe" && selectedTokenId && (
        <AoEControlPanel
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          isAnchored={isAnchored}
          setIsAnchored={setIsAnchored}
          shapeSettings={shapeSettings}
          setShapeSettings={setShapeSettings}
          snapMode={snapMode} // ✅ add this
          setSnapMode={setSnapMode}
        />
      )}

      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onMouseMove={handleMouseMove}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        activeInteractionMode={activeInteractionMode}
      >
        <MapBackground
          imageUrl={map.content.imageUrl}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          cellSize={cellSize}
          mapWidth={map.content.width}
          mapHeight={map.content.height}
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
      />
    </div>
  );
};

export default RefactoredMap;
