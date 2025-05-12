import React from "react";
import useImage from "use-image";
import { Layer, Rect, Circle, Image as KonvaImage } from "react-konva";

import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";
import GridOverlay from "../../../DMToolkit/Maps/GridOverlay";
import TokenLayer from "../../../DMToolkit/Maps/TokenLayer";
import SessionContextMenu from "../Tokens/SessionContextMenu";
import AoEToolbox from "../UI/AoEToolbox";

import { useStageContext } from "../../hooks/useStageContext";
import { useOutsideClickHandler } from "../../hooks/useOutsideClickHandler";
import { useTokenManager } from "../../hooks/useTokenManager";
import { useTokenSelection } from "../../hooks/useTokenSelection";
import { useAoEManager } from "../../hooks/useAoEManager";
import { useTokenMovement } from "../../hooks/useTokenMovement";
import { useDropHandler } from "../../hooks/useDropHandler";
import { useSelectionSync } from "../../hooks/useSelectionSync";
import { emitSelection, emitDeselection } from "../../hooks/useTokenEmitters";

const RenderedMap = ({
  map,
  activeLayer = "dm",
  onTokenMove,
  isDM = false,
  selectedTokenId,
  setSelectedTokenId,
  socket,
  user,
  activeInteractionMode,
  setActiveInteractionMode, // 👈 ADD THIS
  setExternalTokens,
}) => {
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(map);
  const [image] = useImage(map.content.imageUrl);

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
  } = useTokenManager({ map, socket, isDM, user });

  const {
    selectedTokenId: internalSelectedTokenId,
    selectToken,
    clearSelection: internalClearSelection,
  } = useTokenSelection(
    tokens,
    hasControl,
    (id) => emitSelection(socket, map, user, id),
    () => emitDeselection(socket, map, user)
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
    map._id,
    map.content?.campaign // can be undefined here
  );

  const { handleTokenMove } = useTokenMovement({
    map,
    tokens,
    setTokens,
    hasControl,
    socket,
    isDM,
    emitTokenUpdate,
    onTokenMove,
  });

  const { onDrop, onDragOver } = useDropHandler(handleDrop, stageRef);
  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  React.useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

  return (
    <div className="map-rendered-view" onDrop={onDrop} onDragOver={onDragOver}>
      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onMouseMove={(e) => {
          console.log("🖱️ Mouse move detected");
          handleMouseMove(e);
        }}
      >
        <Layer>
          {image && (
            <KonvaImage image={image} width={gridWidth} height={gridHeight} />
          )}
          <Rect
            width={gridWidth}
            height={gridHeight}
            fill="rgba(0,0,0,0.01)"
            listening={true}
            onClick={(e) => {
              console.log("📍 Rect clicked (background layer)");
              handleMapClick(e);
            }}
          />
        </Layer>

        <Layer>
          <GridOverlay
            width={map.content.width}
            height={map.content.height}
            cellSize={cellSize}
          />
        </Layer>

        <Layer>
          {aoeDraft && !aoeDraft.placed && mousePosition && (
            <Circle
              x={mousePosition.x}
              y={mousePosition.y}
              radius={aoeDraft.radius}
              fill={aoeDraft.color}
              stroke="gray"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
              opacity={0.5}
            />
          )}
          {(aoeShapes[map._id] || []).map((aoe) => (
            <Circle
              key={aoe.id}
              x={aoe.x}
              y={aoe.y}
              radius={aoe.radius}
              fill={aoe.color}
              stroke="black"
              strokeWidth={2}
              onContextMenu={(e) => {
                e.evt.preventDefault();
                console.log("🗑️ AoE right-clicked for removal:", aoe.id);
                removeAoE(aoe.id);
              }}
            />
          ))}
        </Layer>

        <Layer>
          <TokenLayer
            isInteractive={activeInteractionMode !== "aoe"}
            tokens={
              activeLayer === "dm"
                ? tokens
                : tokens.filter((t) => t.layer === activeLayer)
            }
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

              // ✅ After AoE is placed, return to Select mode
            }}
            selectedTokenId={internalSelectedTokenId}
            activeLayer={activeLayer}
            canMove={(token) =>
              activeInteractionMode === "select" &&
              hasControl(token) &&
              selectedTokenId === token.id
            }
            externalSelections={externalSelections}
          />
        </Layer>
      </ZoomableStage>

      {isDM && (
        <SessionContextMenu
          contextMenu={contextMenu}
          onAction={handleTokenAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showAoEToolbox && <AoEToolbox onConfirm={confirmAoE} />}
    </div>
  );
};

export default RenderedMap;
