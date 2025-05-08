import React, { useContext, useState, useEffect } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import ChatBox from "../Session/SharedComponents/ChatBox";
import { UserContext } from "../../context/UserContext";
import TokenManager from "../Session/DMComponents/Tokens/TokenManager"; // import TokenManager component
import Toolbar from "../Session/DMComponents/Toolbar"; // import the new Toolbar component

const DMView = ({ campaign, socket }) => {
  const { user } = useContext(UserContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ x: 220, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const startDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

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

      <main className="dm-map-area">
        <div className="map-placeholder">
          <p>No map loaded yet.</p>
        </div>
      </main>

      {activeTool === "tokens" && (
        <TokenManager
          token={user.token}
          campaign={campaign} // ⬅️ send full campaign object
          setActiveTool={setActiveTool}
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
