import React, { useRef } from "react";
import ZoomableStage from "../../../DMToolkit/Maps/ZoomableStage";
import GridOverlay from "../../../DMToolkit/Maps/GridOverlay";
import TokenLayer from "../../../DMToolkit/Maps/TokenLayer";
import { Layer } from "react-konva";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

const RenderedMap = ({ map, activeLayer = "dm", onTokenMove }) => {
  const [image] = useImage(map.content.imageUrl);
  const stageRef = useRef();
  const cellSize = 70;

  const gridWidth = map.content.width * cellSize;
  const gridHeight = map.content.height * cellSize;

  const placedTokens = map.content.placedTokens || [];

  return (
    <div className="map-rendered-view">
      <ZoomableStage
        ref={stageRef}
        width={gridWidth}
        height={gridHeight}
        onDrop={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
      >
        <Layer>
          {image && (
            <KonvaImage image={image} width={gridWidth} height={gridHeight} />
          )}
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
                ? placedTokens
                : placedTokens.filter((t) => t.layer === activeLayer)
            }
            onDragEnd={onTokenMove || (() => {})}
            onRightClick={() => {}}
            activeLayer={activeLayer}
          />
        </Layer>
      </ZoomableStage>
    </div>
  );
};

export default RenderedMap;
