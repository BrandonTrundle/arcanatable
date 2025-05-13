import { useState, useEffect } from "react";

const useDMViewState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ x: 220, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarExiting, setToolbarExiting] = useState(false);
  const [activeInteractionMode, setActiveInteractionMode] = useState("select");
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [selectedMonster, setSelectedMonster] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPanelPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (selectedTokenId) {
      setShowToolbar(true);
      setToolbarExiting(false);
    } else if (showToolbar) {
      setToolbarExiting(true);
      const timeout = setTimeout(() => {
        setShowToolbar(false);
        setToolbarExiting(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [selectedTokenId, showToolbar]);

  const startDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    activeTool,
    setActiveTool,
    panelPosition,
    isDragging,
    startDrag,
    selectedTokenId,
    setSelectedTokenId,
    showToolbar,
    toolbarExiting,
    activeInteractionMode,
    setActiveInteractionMode,
    selectedNPC,
    setSelectedNPC,
    selectedMonster,
    setSelectedMonster,
  };
};

export default useDMViewState;
