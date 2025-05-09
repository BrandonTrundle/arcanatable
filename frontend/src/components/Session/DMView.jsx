import React, { useContext, useState, useEffect } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import ChatBox from "../Session/SharedComponents/ChatBox";
import { UserContext } from "../../context/UserContext";
import TokenManager from "../Session/DMComponents/Tokens/TokenManager"; // import TokenManager component
import Toolbar from "../Session/DMComponents/Toolbar"; // import the new Toolbar component
import MapLoaderPanel from "../Session/DMComponents/Maps/MapLoaderPanel";
import RenderedMap from "../Session/DMComponents/Maps/RenderedMap";
import loadMapFallback from "../../assets/LoadMapToProceed.png";

const DMView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [activeMap, setActiveMap] = useState(sessionMap || null);
  useEffect(() => {
    if (sessionMap) {
      setActiveMap(sessionMap);
    }
  }, [sessionMap]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ x: 220, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState("dm");

  const startDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    socket.on("loadMap", (map) => {
      console.log("📥 DM received map:", map);
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
          socket={socket} // ✅ This is what’s missing!
          user={user}
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
          campaign={campaign} // ⬅️ send full campaign object
          setActiveTool={setActiveTool}
        />
      )}

      {activeTool === "maps" && (
        <div className="dm-maps-panel">
          <MapLoaderPanel campaign={campaign} socket={socket} />
        </div>
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
