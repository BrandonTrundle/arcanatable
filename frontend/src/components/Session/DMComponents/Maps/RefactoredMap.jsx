import React, { useEffect, useRef, useCallback, useState } from "react";
import useImage from "use-image";
import { Layer, Line, Text, Arrow } from "react-konva";

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
import MeasurementPanel from "../../Measurement/MeasurementPanel";
import throttle from "lodash.throttle";
import { calculateDistance } from "../Maps/hooks/mapUtils";
import { useEmitMeasurement } from "../Maps/hooks/useEmitMeasurement";
import { useMeasurementSockets } from "../Maps/hooks/useMeasurementSockets";
import { useTokenMoverWithAOE } from "../Maps/hooks/useTokenMoverWithAOE";
import { useAoEStateManager } from "../Maps/hooks/useAoEStateManager";
import MeasurementRender from "./MeasurementRender";
import TokenLayerContainer from "./TokenLayerContainer";
import MapStageScene from "./MapStageScene";
import { useMeasurementState } from "../Maps/hooks/useMeasurementState";
import { useTokenHPOverlay } from "../Maps/hooks/useTokenHPOverlay";
import { useMapInteractionHandlers } from "../Maps/hooks/useMapInteractionHandlers";

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
  const [showMeasurementPanel, setShowMeasurementPanel] = useState(true);
  const prevInteractionMode = useRef(null);
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(
    map || {}
  );
  const containerRef = useRef();
  const [image] = useImage(map?.content?.imageUrl || "");
  const {
    snapMode,
    setSnapMode,
    shapeSettings,
    setShapeSettings,
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
  } = useAoEStateManager({
    activeInteractionMode,
    setActiveInteractionMode,
    selectedTokenId,
    stageRef,
    addAOE,
    cellSize,
  });

  const {
    measureTarget,
    setMeasureTarget,
    broadcastEnabled,
    setBroadcastEnabled,
    measurementColor,
    setMeasurementColor,
    snapSetting,
    setSnapSetting,
    lockMeasurement,
    setLockMeasurement,
    remoteMeasurements,
    setRemoteMeasurements,
    lockedMeasurements,
    setLockedMeasurements,
  } = useMeasurementState();

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

  useEffect(() => {
    if (socket && map?._id) {
      socket.emit("joinRoom", map._id);
      //  console.log("[SOCKET] Joined room:", map._id);
    }
  }, [socket, map?._id]);

  useEffect(() => {
    if (
      activeInteractionMode === "measure" &&
      prevInteractionMode.current !== "measure"
    ) {
      setShowMeasurementPanel(true); // Only re-open if coming from a different tool
    }
    prevInteractionMode.current = activeInteractionMode;
  }, [activeInteractionMode]);

  const selectedToken = tokens.find((t) => t.id === selectedTokenId);
  const tokenCenterX = selectedToken?.x ?? 0;
  const tokenCenterY = selectedToken?.y ?? 0;

  const { handleTokenMove, handleTokenDrag, handleMapClick } =
    useMapInteractionHandlers({
      rawHandleTokenMove,
      aoes,
      updateAOE,
      isDM,
      socket,
      mapId: map?._id,
      cellSize,
      setTokens,
      lockMeasurement,
      broadcastEnabled,
      selectedToken,
      selectedTokenId,
      measureTarget,
      measurementColor,
      user,
      setLockedMeasurements,
      setMeasureTarget,
      activeInteractionMode,
    });

  const { onDrop, onDragOver } = useDropHandler(handleDrop, stageRef);
  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

  useEffect(() => {
    if (activeInteractionMode !== "measure" || !selectedTokenId) {
      console.log("[DEBUG] Clearing measureTarget due to mode/token change");
      setMeasureTarget(null);

      if (socket && map?._id && user?._id) {
        console.log("[SOCKET] Emitting measurement:clearMy", {
          mapId: map._id,
          userId: user._id,
        });

        socket.emit("measurement:clearMy", {
          mapId: map._id,
          userId: user._id,
        });
      }
    }
  }, [activeInteractionMode, selectedTokenId]);

  useEffect(() => {
    console.log("[DEBUG] selectedTokenId:", selectedTokenId);
  }, [selectedTokenId]);

  useMeasurementSockets({
    socket,
    userId: user._id,
    setRemoteMeasurements,
    setLockedMeasurements,
  });

  if (!map || !map._id || !map.content) {
    return null;
  }

  const emitMeasurement = useEmitMeasurement({
    broadcastEnabled,
    socket,
    mapId: map?._id,
    userId: user?._id,
    selectedToken,
    selectedTokenId,
  });

  const tokensWithHP = useTokenHPOverlay(tokens, combatState);

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
          snapMode={snapMode}
          setSnapMode={setSnapMode}
        />
      )}

      {activeInteractionMode === "measure" && showMeasurementPanel && (
        <MeasurementPanel
          broadcastEnabled={broadcastEnabled}
          setBroadcastEnabled={setBroadcastEnabled}
          measurementColor={measurementColor}
          setMeasurementColor={setMeasurementColor}
          snapSetting={snapSetting}
          setSnapSetting={setSnapSetting}
          lockMeasurement={lockMeasurement}
          setLockMeasurement={setLockMeasurement}
          lockedMeasurements={lockedMeasurements}
          setLockedMeasurements={setLockedMeasurements}
          isDM={isDM}
          mapId={map._id}
          userId={user._id}
          socket={socket}
          onClose={() => setShowMeasurementPanel(false)}
        />
      )}

      <MapStageScene
        map={map}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        cellSize={cellSize}
        stageRef={stageRef}
        imageUrl={map?.content?.imageUrl}
        activeInteractionMode={activeInteractionMode}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMapClick={handleMapClick}
        selectedTokenId={selectedTokenId}
        selectedToken={selectedToken}
        measureTarget={measureTarget}
        measurementColor={measurementColor}
        emitMeasurement={emitMeasurement}
        aoes={aoes}
        internalSelectedTokenId={internalSelectedTokenId}
        tokens={tokens}
        removeAOE={removeAOE}
        selectedShape={selectedShape}
        shapeSettings={shapeSettings}
        isDraggingAoE={isDraggingAoE}
        aoeDragOrigin={aoeDragOrigin}
        aoeDragTarget={aoeDragTarget}
        snapMode={snapMode}
        handleTokenMove={handleTokenMove}
        handleTokenDrag={handleTokenDrag}
        handleTokenRightClick={handleTokenRightClick}
        selectToken={selectToken}
        activeLayer={activeLayer}
        hasControl={hasControl}
        externalSelections={externalSelections}
        isCombatMode={isCombatMode}
        showTokenInfo={showTokenInfo}
        lockedMeasurements={lockedMeasurements}
        remoteMeasurements={remoteMeasurements}
        setMeasureTarget={setMeasureTarget}
      />

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
