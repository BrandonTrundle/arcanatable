import React, { useState, useRef, useEffect, useCallback } from "react";
import ZoomableStage from "./ZoomableStage";
import GridOverlay from "./GridOverlay";
import TokenLayer from "./TokenLayer";
import LayerControlPanel from "./LayerControlPanel";
import MapEditorContextMenu from "./MapEditorContextMenu";
import { Layer } from "react-konva";
import { Image as KonvaImage } from "react-konva";
import { updateMapTokens } from "../../../services/mapService";
import { useUserContext } from "../../../context/UserContext";
import useImage from "use-image";
import { createPortal } from "react-dom";
import "../../../styles/MapEditor.css";
import HPDOMOverlay from "./TokenLayerRefactor/visuals/HPDOMOverlay";
import "../../../styles/HPDOMOverlay.css";

const MapEditor = ({ map, onClose, onMapUpdate }) => {
  const [image] = useImage(
    map.content.imageUrl?.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${map.content.imageUrl}`
      : map.content.imageUrl
  );
  const [activeLayer, setActiveLayer] = useState("dm");
  const [placedTokens, setPlacedTokens] = useState(
    () => map?.content?.placedTokens || []
  );
  const [contextMenu, setContextMenu] = useState(null);
  const stageRef = useRef();
  const containerRef = useRef();

  const { user } = useUserContext();
  const cellSize = 70;
  const squaresX = map.content.width;
  const squaresY = map.content.height;
  const gridWidth = squaresX * cellSize;
  const gridHeight = squaresY * cellSize;

  const handleDrop = (e) => {
    e.preventDefault();
    if (!stageRef.current || activeLayer !== "dm") return;

    const stage = stageRef.current.getStage();
    const scale = stage.scaleX(); // assumes uniform scale

    const stageBox = stage.container().getBoundingClientRect();
    const pointerX = e.clientX - stageBox.left;
    const pointerY = e.clientY - stageBox.top;

    const x = (pointerX - stage.x()) / scale - 32;
    const y = (pointerY - stage.y()) / scale - 32;

    const tokenData = JSON.parse(e.dataTransfer.getData("application/json"));

    const newToken = {
      id: `${tokenData._id}-${Date.now()}`,
      imageUrl:
        tokenData.content.image ||
        tokenData.content.avatar ||
        tokenData.content.imageUrl ||
        "",
      x,
      y,
      tokenSize:
        tokenData.content.tokenSize || tokenData.content.size || "Medium",
      layer: "dm",
    };

    setPlacedTokens((prev) => [...prev, newToken]);
    //console.log("New token:", newToken);
  };

  const handleDragOver = (e) => e.preventDefault();

  const updateTokenPosition = useCallback((id, newX, newY) => {
    requestAnimationFrame(() => {
      setPlacedTokens((prev) =>
        prev.map((token) =>
          token.id === id ? { ...token, x: newX, y: newY } : token
        )
      );
    });
  }, []);

  const handleSave = async () => {
    try {
      const updatedMap = await updateMapTokens(
        map._id,
        placedTokens,
        user.token
      );
      alert("Map tokens saved successfully!");
      if (onMapUpdate) onMapUpdate(updatedMap);
    } catch (err) {
      alert("Failed to save tokens.");
    }
  };

  const handleDeleteToken = (tokenId) => {
    setPlacedTokens((prev) => prev.filter((t) => t.id !== tokenId));
    setContextMenu(null);
  };

  useEffect(() => {
    setPlacedTokens(map?.content?.placedTokens || []);
  }, [map]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    // Ensure Konva canvas can receive focus for wheel events
    if (stageRef.current?.content) {
      stageRef.current.content.tabIndex = 0;
      stageRef.current.content.focus();
    }
  }, []);

  const handleTokenAction = (action, tokenId, arg) => {
    setContextMenu(null);

    if (action === "delete") {
      setPlacedTokens((prev) => prev.filter((t) => t.id !== tokenId));
      return;
    }

    if (action === "to-dm" || action === "to-player") {
      const newLayer = action === "to-dm" ? "dm" : "player";
      setPlacedTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, layer: newLayer } : t))
      );
      return;
    }

    if (action === "number") {
      const baseName = prompt("Base name (e.g., Gnoll):");
      const count =
        placedTokens.filter((t) => t.title?.startsWith(baseName)).length + 1;

      setPlacedTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId ? { ...t, title: `${baseName} ${count}` } : t
        )
      );
      return;
    }

    if (action === "resize") {
      //console.log("Switching to resize mode for:", tokenId);
      setContextMenu((prev) => ({
        ...prev,
        tokenId, // 🛠 re-insert tokenId explicitly
        mode: "resize",
      }));
      return;
    }

    if (action === "apply-resize") {
      const newSize = arg; // arg is the third param from onAction
      setPlacedTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, tokenSize: newSize } : t))
      );
      //console.log("Updated token size:", tokenId, newSize);
      setContextMenu(null);
      return;
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-editor-overlay"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <button onClick={onClose} className="close-editor-btn">
        ❌ Close Editor
      </button>
      <button onClick={handleSave} className="save-editor-btn">
        💾 Save Changes
      </button>

      {createPortal(
        <LayerControlPanel
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />,
        document.body // render into root body so it's not clipped
      )}

      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Layer>
          {image && (
            <KonvaImage image={image} width={gridWidth} height={gridHeight} />
          )}
        </Layer>

        <Layer>
          <GridOverlay width={squaresX} height={squaresY} cellSize={cellSize} />
        </Layer>

        <Layer>
          <TokenLayer
            tokens={
              activeLayer === "dm"
                ? placedTokens
                : placedTokens.filter((t) => t.layer === activeLayer)
            }
            onDragEnd={updateTokenPosition}
            onRightClick={(e, id) => {
              e.evt.preventDefault();
              const stage = stageRef.current.getStage();
              const token = placedTokens.find((t) => t.id === id);
              if (!token) return;

              const scale = stage.scaleX();
              const pos = stage.position();
              const screenX = token.x * scale + pos.x;
              const screenY = token.y * scale + pos.y;

              setContextMenu({
                tokenId: id,
                x: screenX,
                y: screenY,
                currentSize: token.tokenSize || "Medium",
                mode: null,
              });
            }}
            onClick={() => {}} // 👈 ADD THIS TO AVOID onClick undefined
            activeLayer={activeLayer}
          />
        </Layer>
      </ZoomableStage>

      <HPDOMOverlay
        tokens={
          activeLayer === "dm"
            ? placedTokens
            : placedTokens.filter((t) => t.layer === activeLayer)
        }
        containerRef={containerRef}
        stageRef={stageRef}
      />

      <MapEditorContextMenu
        contextMenu={contextMenu}
        onAction={handleTokenAction}
        onClose={() => setContextMenu(null)}
      />
    </div>
  );
};

export default MapEditor;
