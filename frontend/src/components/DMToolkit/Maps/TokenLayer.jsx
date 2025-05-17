// Reverted TokenLayer.jsx and Token component to restore token interactivity
import React, { memo } from "react";
import { Group, Rect, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

// Individual token component
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
  onClick,
  draggable,
  isSelected,
  isExternallySelected,
  selectedBy,
}) => {
  const [img] = useImage(
    imageUrl?.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${imageUrl}`
      : imageUrl,
    "anonymous"
  );
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

  return (
    <Group
      x={x}
      y={y}
      offsetX={offset}
      offsetY={offset}
      opacity={opacity}
      draggable={draggable}
      dragBoundFunc={(pos) => pos}
      onDragEnd={(e) => {
        if (!draggable) return;
        const { x, y } = e.target.position();
        //console.log("📦 Token dragged:", id, "to", x, y);
        onDragEnd(id, x, y);
      }}
      onContextMenu={(e) => {
        // console.log("🖱️ Token context menu:", id);
        onRightClick?.(e);
      }}
      onClick={(e) => {
        //  console.log("🖱️ Token clicked:", id);
        onClick?.(e);
      }}
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
      {/* External selection highlight */}
      {isExternallySelected && (
        <>
          <Rect
            width={visualSize + 16}
            height={visualSize + 16}
            offsetX={8}
            offsetY={8}
            stroke="deepskyblue"
            strokeWidth={3}
            dash={[4, 4]}
            cornerRadius={visualSize / 2}
          />
          {selectedBy && (
            <Text
              text={selectedBy}
              fontSize={12}
              fill="deepskyblue"
              y={-offset - 18}
              x={-offset}
              width={visualSize}
              align="center"
            />
          )}
        </>
      )}

      {/* Local selection highlight */}
      {isSelected && (
        <Rect
          width={visualSize + 10}
          height={visualSize + 10}
          offsetX={5}
          offsetY={5}
          fill="rgba(255, 255, 0, 0.2)"
          stroke="gold"
          strokeWidth={4}
          cornerRadius={visualSize / 2}
        />
      )}

      {/* Base token */}
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

// TokenLayer renders multiple tokens
const TokenLayer = ({
  tokens,
  onDragEnd,
  onRightClick,
  onClick,
  selectedTokenId,
  activeLayer,
  canMove = () => true,
  externalSelections = {},
  isInteractive = true,
}) => {
  return (
    <>
      {tokens.map((token) => {
        const draggable =
          typeof canMove === "function" ? canMove(token) : !!canMove;

        return (
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
            onRightClick={(e) => {
              //console.log("🖱️ Right-click on token layer:", token.id);
              isInteractive && onRightClick(e, token.id);
            }}
            onClick={(e) => {
              //console.log("🖱️ Click on token layer:", token.id);
              isInteractive && onClick(e, token.id);
            }}
            draggable={isInteractive && draggable}
            isSelected={selectedTokenId === token.id}
            isExternallySelected={!!externalSelections[token.id]}
            selectedBy={externalSelections[token.id]?.username}
          />
        );
      })}
    </>
  );
};

export default TokenLayer;
