import React, { useContext, useState, useEffect } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import ChatBox from "../Session/SharedComponents/ChatBox";
import { UserContext } from "../../context/UserContext";
import TokenManager from "../Session/DMComponents/Tokens/TokenManager";
import Toolbar from "./DMComponents/UI/DMToolbar";
import MapLoaderPanel from "../Session/DMComponents/Maps/MapLoaderPanel";
import RenderedMap from "../Session/DMComponents/Maps/RenderedMap";
import InteractionToolbar from "../Session/DMComponents/UI/InteractionToolbar";
import loadMapFallback from "../../assets/LoadMapToProceed.png";

const DMView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);

  const [activeMap, setActiveMap] = useState(sessionMap || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ x: 220, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState("dm");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [activeInteractionMode, setActiveInteractionMode] = useState("select");
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarExiting, setToolbarExiting] = useState(false);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (sessionMap) {
      setActiveMap(sessionMap);
    }
  }, [sessionMap]);

  useEffect(() => {
    socket.on("loadMap", (map) => {
      //   console.log("📥 DM received map:", map);
      setActiveMap(map);
    });
    return () => socket.off("loadMap");
  }, [socket]);

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
      }, 300); // matches CSS animation duration

      return () => clearTimeout(timeout);
    }
  }, [selectedTokenId, showToolbar]);

  const saveCurrentMap = async () => {
    if (!activeMap || !activeMap._id) return;

    try {
      const res = await fetch(`/api/dmtoolkit/${activeMap._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            ...activeMap.content,
            placedTokens: tokens, // ✅ use latest token state
          },
        }),
      });

      if (!res.ok) {
        console.error("❌ Failed to save map state.");
      } else {
        console.log("✅ Map state saved before switching.");
      }
    } catch (err) {
      console.error("🚫 Error while saving map state:", err);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Save token state before leaving
      if (typeof saveCurrentMap === "function") {
        saveCurrentMap();
      }
      // Optionally trigger a prompt — modern browsers may ignore this.
      e.preventDefault();
      e.returnValue = ""; // For older browser support
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveCurrentMap]);

  const startDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="dm-session-container">
      <aside className={`dm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <Toolbar
          setActiveTool={setActiveTool}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      {activeMap && activeMap.content ? (
        <RenderedMap
          map={activeMap}
          activeLayer={activeLayer}
          isDM={true}
          socket={socket}
          user={user}
          selectedTokenId={selectedTokenId}
          setSelectedTokenId={setSelectedTokenId}
          activeInteractionMode={activeInteractionMode}
          setExternalTokens={setTokens}
        />
      ) : (
        <div className="map-placeholder">
          <img
            src={loadMapFallback}
            alt="No map loaded"
            style={{ width: "60%", opacity: 0.8 }}
          />
          <p style={{ color: "#ccc" }}>No map loaded yet.</p>
        </div>
      )}

      {activeTool === "tokens" && (
        <TokenManager
          token={user.token}
          campaign={campaign}
          setActiveTool={setActiveTool}
        />
      )}

      {activeTool === "maps" && (
        <div className="dm-maps-panel">
          <MapLoaderPanel
            campaign={campaign}
            socket={socket}
            saveCurrentMap={saveCurrentMap}
          />
        </div>
      )}

      {showToolbar && (
        <InteractionToolbar
          activeMode={activeInteractionMode}
          setActiveMode={setActiveInteractionMode}
          className={toolbarExiting ? "exit" : ""}
        />
      )}

      <aside className="dm-chat-panel">
        <ChatBox
          socket={socket}
          campaignId={campaign._id}
          username={user.username}
        />
      </aside>
    </div>
  );
};

export default DMView;
