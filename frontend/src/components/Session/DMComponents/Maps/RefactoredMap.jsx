import React, { useState, useEffect, useCallback, useRef } from "react";
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
}) => {
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(
    map || {}
  );
  const containerRef = useRef();
  const [image] = useImage(map?.content?.imageUrl || "");
  const [isDraggingAoE, setIsDraggingAoE] = useState(false);
  const [aoeDragOrigin, setAoeDragOrigin] = useState(null); // { x, y }
  const [aoeDragTarget, setAoeDragTarget] = useState(null); // { x, y }
  const [selectedShape, setSelectedShape] = useState("cone");
  const [isAnchored, setIsAnchored] = useState(true);

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

  useEffect(() => {
    console.log(
      "🔍 AoE mode:",
      activeInteractionMode,
      "Selected token:",
      selectedTokenId
    );
  }, [activeInteractionMode, selectedTokenId]);

  const handleMouseDown = useCallback(
    (e) => {
      if (activeInteractionMode !== "aoe" || !selectedTokenId) return;

      console.log("👆 Mouse down: initiating AoE drag");

      const stage = stageRef.current?.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const origin = transform.point(pointer);

      setAoeDragOrigin(origin);
      setAoeDragTarget(origin);
      setIsDraggingAoE(true);
    },
    [activeInteractionMode, selectedTokenId, stageRef]
  );

  // Placeholder no-ops to satisfy usage
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingAoE || activeInteractionMode !== "aoe") return;

      const stage = stageRef.current?.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const target = transform.point(pointer);

      setAoeDragTarget(target);
    },
    [isDraggingAoE, activeInteractionMode, stageRef]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (!isDraggingAoE || !aoeDragOrigin || !aoeDragTarget) return;

      const dx = aoeDragTarget.x - aoeDragOrigin.x;
      const dy = aoeDragTarget.y - aoeDragOrigin.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const dragDistance = Math.hypot(
        aoeDragTarget.x - aoeDragOrigin.x,
        aoeDragTarget.y - aoeDragOrigin.y
      );

      if (dragDistance < 5) {
        console.log("🛑 Drag too short, not placing AoE.");
        setIsDraggingAoE(false);
        setAoeDragOrigin(null);
        setAoeDragTarget(null);
        return;
      }

      const newAoE = {
        type: selectedShape,
        anchored: isAnchored,
        x: selectedShape === "circle" ? aoeDragTarget.x : aoeDragOrigin.x,
        y: selectedShape === "circle" ? aoeDragTarget.y : aoeDragOrigin.y,
        radius: 150,
        angle: selectedShape === "cone" ? 60 : undefined,
        width:
          selectedShape === "line" ||
          selectedShape === "rectangle" ||
          selectedShape === "square"
            ? selectedShape === "square"
              ? 120
              : 200
            : undefined,
        height:
          selectedShape === "rectangle" || selectedShape === "square"
            ? selectedShape === "square"
              ? 120
              : 100
            : undefined,
        direction: angle,
        sourceTokenId: selectedTokenId,
        color: "rgba(255, 165, 0, 0.5)",
      };

      console.log("🧱 Finalizing AoE placement:", newAoE);
      addAOE(newAoE);

      setIsDraggingAoE(false);
      setAoeDragOrigin(null);
      setAoeDragTarget(null);
    },
    [
      isDraggingAoE,
      aoeDragOrigin,
      aoeDragTarget,
      addAOE,
      selectedTokenId,
      selectedShape,
      isAnchored,
    ]
  );

  const handleMapClick = useCallback(
    (e) => {
      // Disable legacy AoE click-placing logic
      if (activeInteractionMode === "aoe") return;

      // If you want to support other non-AoE click actions, you can handle them here
      // For now, it's a no-op
    },
    [activeInteractionMode]
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

  if (!map || !map._id || !map.content) {
    return null;
  }

  useEffect(() => {
    const handleWindowMouseUp = (e) => {
      if (!isDraggingAoE) return;
      // We still want to call the main handler manually
      handleMouseUp(e);
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDraggingAoE, handleMouseUp]);

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
        />
      )}
      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onMouseMove={handleMouseMove}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        activeInteractionMode={activeInteractionMode} // ✅ Add this line
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
