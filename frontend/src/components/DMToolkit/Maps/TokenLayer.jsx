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
        const { x, y } = e.target.position();
        onDragEnd(id, x, y);
      }}
      onContextMenu={onRightClick}
      onClick={onClick ? () => onClick(id) : undefined}
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
            listening={false}
            pointerEvents="none"
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
              listening={false}
              pointerEvents="none"
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
          listening={false}
          pointerEvents="none"
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
  canMove = () => true, // safe default
  externalSelections = {},
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
            onRightClick={(e) => onRightClick(e, token.id)}
            onClick={onClick}
            draggable={draggable}
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
