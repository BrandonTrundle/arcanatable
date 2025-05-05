import React, { memo } from 'react';
import { Group, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

const Token = memo(({ id, x, y, imageUrl, title, layer, activeLayer, onDragEnd, onRightClick }) => {
  const [img] = useImage(imageUrl, 'anonymous');
  if (!img) return null;

  // ✅ Define opacity based on layer logic
  const isDM = activeLayer === 'dm';
  const isPlayerToken = layer === 'player';
  const opacity = isDM ? (isPlayerToken ? 1 : 0.3) : 1;

  return (
    <Group
      x={x}
      y={y}
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
        if (stage) stage.container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'default';
      }}
      title={title || id}
    >
      <Rect
        width={64}
        height={64}
        cornerRadius={32}
        stroke="saddlebrown"
        strokeWidth={2}
        fill="antiquewhite"
      />
      <KonvaImage image={img} width={64} height={64} cornerRadius={32} />
    </Group>
  );
});

const TokenLayer = ({ tokens, onDragEnd, onRightClick, activeLayer }) => {
  return (
    <>
      {tokens.map((token) => (
        <Token
          key={token.id}
          id={token.id}
          x={token.x}
          y={token.y}
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
