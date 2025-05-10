import React, { useContext, useState, useEffect } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import "../../styles/SessionStyles/SharedStyles/ChatBox.css";
import Toolbar from "../Session/PlayerComponents/Toolbar";
import ChatBox from "../Session/SharedComponents/ChatBox";
import { UserContext } from "../../context/UserContext";
import loadMapFallback from "../../assets/LoadMapToProceed.png";
import RenderedMap from "../Session/DMComponents/Maps/RenderedMap";
import PlayerTokenManager from "./PlayerComponents/Tokens/PlayerTokenManager";
import InteractionToolbar from "../Session/DMComponents/UI/InteractionToolbar";

const PlayerView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMap, setActiveMap] = useState(sessionMap || null);
  const [activeTool, setActiveTool] = useState(null);
  const [activeInteractionMode, setActiveInteractionMode] = useState("select");
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  useEffect(() => {
    if (sessionMap) {
      setActiveMap(sessionMap);
    }
  }, [sessionMap]);

  useEffect(() => {
    socket.on("loadMap", (map) => {
      console.log("📥 Player received map:", map);
      setActiveMap(map);
    });

    return () => socket.off("loadMap");
  }, [socket]);

  return (
    <div className="dm-session-container">
      <aside className={`dm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <Toolbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveTool={setActiveTool}
        />
      </aside>

      <main className="dm-map-area">
        {activeMap && activeMap.content ? (
          <RenderedMap
            map={activeMap}
            activeLayer="player"
            isDM={false}
            socket={socket}
            user={user}
            activeInteractionMode={activeInteractionMode}
            selectedTokenId={selectedTokenId}
            setSelectedTokenId={setSelectedTokenId}
          />
        ) : (
          <div className="map-placeholder">
            <img
              src={loadMapFallback}
              alt="No map loaded"
              style={{ width: "60%", opacity: 0.5 }}
            />
            <p style={{ color: "#ccc" }}>Waiting for DM to load a map...</p>
          </div>
        )}

        {selectedTokenId && (
          <InteractionToolbar
            activeMode={activeInteractionMode}
            setActiveMode={setActiveInteractionMode}
          />
        )}
      </main>

      {activeTool === "tokens" && (
        <div className="player-token-panel">
          <PlayerTokenManager
            campaignId={campaign._id}
            userToken={user.token}
            onClose={() => setActiveTool(null)} // 👈 this line
          />
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

export default PlayerView;
