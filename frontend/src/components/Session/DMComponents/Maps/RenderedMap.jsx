import React, { useEffect } from "react";
import useImage from "use-image";
import { Layer, Rect } from "react-konva";
import { Image as KonvaImage } from "react-konva";

import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";
import GridOverlay from "../../../DMToolkit/Maps/GridOverlay";
import TokenLayer from "../../../DMToolkit/Maps/TokenLayer";
import SessionContextMenu from "../Tokens/SessionContextMenu";

import { useTokenManager } from "../../hooks/useTokenManager";
import { useStageContext } from "../../hooks/useStageContext";
import { useOutsideClickHandler } from "../../hooks/useOutsideClickHandler";
import { useTokenSelection } from "../../hooks/useTokenSelection";

const RenderedMap = ({
  map,
  activeLayer = "dm",
  onTokenMove,
  isDM = false,
  socket,
  user,
}) => {
  const { stageRef, cellSize, gridWidth, gridHeight } = useStageContext(map);
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

  // Emits when a token is selected
  const emitSelection = (tokenId) => {
    const campaignId = map?.content?.campaign;
    const mapId = map?._id;
    const userId = user?._id;

    if (socket && mapId && userId && campaignId) {
      const payload = {
        mapId,
        campaignId,
        tokenId,
        userId,
        username: user.username,
      };
      console.log("📤 Emitting tokenSelected:", payload);
      socket.emit("tokenSelected", payload);
    } else {
      console.warn("🚫 emitSelection called with missing socket/map/user");
      console.log("🧩 Debug emitSelection check:", {
        socket,
        mapId,
        campaignId,
        userId,
      });
    }
  };

  // Emits when a selection is cleared
  const emitDeselection = () => {
    if (socket && map?._id && user?._id) {
      socket.emit("tokenDeselected", {
        mapId: map._id,
        campaignId: map.content?.campaign,
        userId: user._id,
      });
    }
  };

  // Use the hook, renaming internal clear to avoid conflict
  const {
    selectedTokenId,
    selectToken,
    clearSelection: internalClearSelection,
  } = useTokenSelection(tokens, hasControl, emitSelection, emitDeselection);

  // This is the public clearSelection you’ll use in your component
  const clearSelection = () => {
    internalClearSelection();
    emitDeselection();
  };

  const [image] = useImage(map.content.imageUrl);

  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  return (
    <div
      className="map-rendered-view"
      onDrop={(e) => handleDrop(e, stageRef)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
    >
      <ZoomableStage ref={stageRef} width={gridWidth} height={gridHeight}>
        <Layer>
          {image && (
            <KonvaImage image={image} width={gridWidth} height={gridHeight} />
          )}
          <Rect
            width={gridWidth}
            height={gridHeight}
            fill="rgba(0,0,0,0.01)"
            listening={true}
            onClick={() => {
              console.log("🟡 Background clicked");
              clearSelection();
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
          <TokenLayer
            tokens={
              activeLayer === "dm"
                ? tokens
                : tokens.filter((t) => t.layer === activeLayer)
            }
            onDragEnd={(id, x, y) => {
              const token = tokens.find((t) => t.id === id);
              if (!token || !hasControl(token)) return;

              const updated = tokens.map((t) =>
                t.id === id ? { ...t, x, y } : t
              );
              setTokens(updated);
              emitTokenUpdate(updated);
              if (onTokenMove) onTokenMove(id, x, y);
            }}
            onRightClick={(e, id) => handleTokenRightClick(e, id, stageRef)}
            onClick={selectToken}
            selectedTokenId={selectedTokenId}
            activeLayer={activeLayer}
            canMove={hasControl}
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
    </div>
  );
};

export default RenderedMap;
