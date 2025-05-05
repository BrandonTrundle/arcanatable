import React from 'react';
import '../../../styles/MapEditor.css';

const MapEditorContextMenu = ({ contextMenu, onAction }) => {
  if (!contextMenu) return null;

  const { x, y, tokenId } = contextMenu;

  return (
    <div
      className="token-context-menu"
      style={{
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <div onClick={() => onAction('to-dm', tokenId)}>🧙 To DM Layer</div>
      <div onClick={() => onAction('to-player', tokenId)}>🧍 To Player Layer</div>
      <div onClick={() => onAction('number', tokenId)}>🔢 Token Number</div>
      <div onClick={() => onAction('resize', tokenId)}>📏 Edit Size</div>
      <div onClick={() => onAction('delete', tokenId)}>🗑 Delete Token</div>
    </div>
  );
};

export default MapEditorContextMenu;
