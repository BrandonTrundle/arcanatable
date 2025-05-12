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
let saveTimeout = null;

const debounceTokenSave = (mapId, content) => {
  if (!mapId || !content) return;

  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    fetch(`/api/dmtoolkit/${mapId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }).catch((err) => {
      console.error("❌ Debounced token save failed:", err);
    });
  }, 1000); // waits 1 second after last change
};

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
  setExternalTokens, // ✅ New prop to sync tokens back to DMView
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

  useEffect(() => {
    if (typeof setExternalTokens === "function") {
      setExternalTokens(tokens);
    }
  }, [tokens, setExternalTokens]);

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
      //    console.log("📤 Emitting tokenSelected:", payload);
      socket.emit("tokenSelected", payload);
    } else {
      console.warn("🚫 emitSelection called with missing socket/map/user");
      //    console.log("🧩 Debug emitSelection check:", {
      //     socket,
      //    mapId,
      //     campaignId,
      //      userId,
      //      });
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

  // Use the hook, renaming internal values to avoid conflict
  const {
    selectedTokenId: internalSelectedTokenId,
    selectToken,
    clearSelection: internalClearSelection,
  } = useTokenSelection(tokens, hasControl, emitSelection, emitDeselection);

  // Sync internal selection with DMView's state
  useEffect(() => {
    if (typeof setSelectedTokenId === "function") {
      setSelectedTokenId(internalSelectedTokenId);
    }
  }, [internalSelectedTokenId, setSelectedTokenId]);

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

  const saveTokenStateToBackend = async () => {
    if (!map?._id || !tokens || !Array.isArray(tokens)) return;

    try {
      const res = await fetch(`/api/dmtoolkit/${map._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            ...map.content,
            placedTokens: tokens,
          },
        }),
      });

      if (!res.ok) {
        console.error("❌ Failed to save tokens to backend.");
      } else {
        console.log("✅ Token state successfully saved.");
      }
    } catch (err) {
      console.error("🚫 Error saving token state:", err);
    }
  };

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
              //        console.log("🟡 Background clicked");
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

              if (isDM) {
                emitTokenUpdate(updated);

                debounceTokenSave(map._id, {
                  ...map.content,
                  placedTokens: updated,
                });
              } else if (socket) {
                socket.emit("playerMovedToken", {
                  campaignId: map.content?.campaign,
                  mapId: map._id,
                  tokenId: id,
                  x,
                  y,
                });
              }

              if (onTokenMove) onTokenMove(id, x, y);
            }}
            onRightClick={(e, id) => handleTokenRightClick(e, id, stageRef)}
            onClick={selectToken}
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
    </div>
  );
};

export default RenderedMap;
