import React, { useRef, useState, useEffect } from "react";

const DraggableResizablePanel = ({
  children,
  initialPosition = { x: 220, y: 64 },
  initialSize = { width: 300, height: 500 },
}) => {
  const panelRef = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);

  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPosition({ x: newX, y: newY });
    }
    if (isResizing.current) {
      const newWidth =
        e.clientX - panelRef.current.getBoundingClientRect().left;
      const newHeight =
        e.clientY - panelRef.current.getBoundingClientRect().top;
      setSize({
        width: Math.max(newWidth, 250),
        height: Math.max(newHeight, 300),
      });
    }
  };

  const stopActions = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    isResizing.current = true;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopActions);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopActions);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="dm-panel token-panel"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      <div className="token-panel-header" onMouseDown={handleMouseDown}>
        <h3>Token Manager</h3>
      </div>

      {children}

      <div
        className="resize-handle"
        onMouseDown={handleResizeMouseDown}
        style={{
          position: "absolute",
          width: "16px",
          height: "16px",
          right: "0",
          bottom: "0",
          cursor: "nwse-resize",
          background: "transparent",
        }}
      ></div>
    </div>
  );
};

export default DraggableResizablePanel;
