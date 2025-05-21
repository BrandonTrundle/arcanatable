import React, { useEffect, useCallback, useRef } from "react";
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

  // Placeholder no-ops to satisfy usage
  const handleMouseMove = () => {};
  const handleMapClick = () => {};

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
      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onMouseMove={handleMouseMove}
        onClick={handleMapClick}
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
