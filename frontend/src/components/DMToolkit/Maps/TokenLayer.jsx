import React, { memo } from "react";
import { Group, Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

const Token = ({
  id,
  x,
  y,
  imageUrl,
  title,
  size,
  layer,
  activeLayer,
  onDragEnd,
  onRightClick,
}) => {
  const [img] = useImage(imageUrl, "anonymous");
  if (!img) return null;

  const isDM = activeLayer === "dm";
  const isPlayerToken = layer === "player";
  const opacity = isDM ? (isPlayerToken ? 1 : 0.3) : 1;

  const sizeScaleMap = {
    Tiny: 0.5,
    Small: 1,
    Medium: 1,
    Large: 2,
    Huge: 3,
    Gargantuan: 4,
  };

  const scaleFactor = sizeScaleMap[size || "Medium"] || 1;
  const baseSize = 64;
  const visualSize = baseSize * scaleFactor;
  const offset = visualSize / 2;

  console.log("Rendering token", id, "with size", size);

  return (
    <Group
      x={x}
      y={y}
      offsetX={offset}
      offsetY={offset}
      opacity={opacity}
      draggable
      dragBoundFunc={(pos) => pos}
      onDragEnd={(e) => {
        const { x, y } = e.target.position();
        onDragEnd(id, x, y);
      }}
      onContextMenu={onRightClick}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      title={title || id}
    >
      <Rect
        width={visualSize}
        height={visualSize}
        cornerRadius={visualSize / 2}
        stroke="saddlebrown"
        strokeWidth={2}
        fill="antiquewhite"
      />
      <KonvaImage
        image={img}
        width={visualSize}
        height={visualSize}
        cornerRadius={visualSize / 2}
      />
    </Group>
  );
};

const MemoizedToken = memo(Token);
export { MemoizedToken as Token };

const TokenLayer = ({ tokens, onDragEnd, onRightClick, activeLayer }) => {
  return (
    <>
      {tokens.map((token) => (
        <Token
          key={token.id}
          id={token.id}
          x={token.x}
          y={token.y}
          size={token.tokenSize}
          imageUrl={token.imageUrl}
          title={token.title}
          layer={token.layer}
          activeLayer={activeLayer}
          onDragEnd={onDragEnd}
          onRightClick={(e) => onRightClick(e, token.id)}
        />
      ))}
    </>
  );
};

export default TokenLayer;
