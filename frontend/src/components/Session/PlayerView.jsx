import React, { useContext, useState, useEffect } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import "../../styles/SessionStyles/SharedStyles/ChatBox.css";
import Toolbar from "./PlayerComponents/PlayerToolbar";
import ChatBox from "../Session/SharedComponents/ChatBox";
import { UserContext } from "../../context/UserContext";
import loadMapFallback from "../../assets/LoadMapToProceed.png";
import RenderedMap from "../Session/DMComponents/Maps/RenderedMap";
import PlayerTokenManager from "./PlayerComponents/Tokens/PlayerTokenManager";
import InteractionToolbar from "../Session/DMComponents/UI/InteractionToolbar";
import DiceRoller from "../Session/SharedComponents/DiceRoller";

import CharacterPanel from "../Session/PlayerComponents/CharacterPanel";
import BasicsTab from "../CharacterForm/BasicsTab";
import PageTwo from "../CharacterForm/PageTwo";
import PageThree from "../CharacterForm/PageThree";

const PlayerView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMap, setActiveMap] = useState(sessionMap || null);
  const [activeTool, setActiveTool] = useState(null);
  const [activeInteractionMode, setActiveInteractionMode] = useState("select");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentTab, setCurrentTab] = useState("basics");

  useEffect(() => {
    if (sessionMap) setActiveMap(sessionMap);
  }, [sessionMap]);

  useEffect(() => {
    if (user && socket) {
      socket.emit("registerUser", user._id);
    }
  }, [socket, user]);

  useEffect(() => {
    socket.on("loadMap", (map) => setActiveMap(map));
    return () => socket.off("loadMap");
  }, [socket]);

  useEffect(() => {
    const fetchCurrentMap = async () => {
      try {
        const sessionRes = await fetch(
          `/api/sessionstate/${campaign._id}/current-map`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const { mapId } = await sessionRes.json();
        if (!mapId) return;

        const mapRes = await fetch(`/api/dmtoolkit/${mapId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const map = await mapRes.json();
        setActiveMap(map);
      } catch (err) {
        console.error("❌ Failed to fetch map for player:", err);
      }
    };

    fetchCurrentMap();
  }, [campaign._id]);

  const handleFormChange = (e) => {
    setSelectedCharacter((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveCharacter = async () => {
    if (!selectedCharacter) return;

    try {
      const res = await fetch(`/api/characters/${selectedCharacter._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(selectedCharacter),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to save character:", err.message);
        return false;
      }

      console.log("✅ Character auto-saved");
      return true;
    } catch (error) {
      console.error("❌ Auto-save error:", error);
      return false;
    }
  };

  return (
    <div className="dm-session-container">
      <aside className={`dm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <Toolbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveTool={(tool) => {
            if (selectedCharacter) saveCharacter();
            setSelectedCharacter(null);
            setActiveTool((prev) => (prev === tool ? null : tool));
          }}
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
            onClose={() => setActiveTool(null)}
          />
        </div>
      )}

      {activeTool === "dice" && (
        <div className="dice-panel">
          <DiceRoller
            userId={user._id}
            campaignId={campaign._id}
            username={user.username} // <-- add this
            socket={socket}
          />
        </div>
      )}

      {activeTool === "character-sheet" && (
        <div className="player-character-panel character-sheet-panel fly-in active">
          {!selectedCharacter ? (
            <>
              <CharacterPanel
                campaignId={campaign._id}
                onSelect={(char) => {
                  setSelectedCharacter(char);
                  setCurrentTab("basics");
                }}
              />
              <button
                onClick={async () => {
                  await saveCharacter();
                  setActiveTool(null);
                }}
                className="close-panel-btn"
              >
                Close
              </button>
            </>
          ) : (
            <div className="character-sheet-panel">
              <h2>
                {selectedCharacter.charname} – Level {selectedCharacter.level}{" "}
                {selectedCharacter.class}
              </h2>
              <button
                onClick={async () => {
                  await saveCharacter();
                  setSelectedCharacter(null);
                }}
              >
                ← Back to List
              </button>

              <div
                className="character-tab-buttons"
                style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}
              >
                <button
                  className={currentTab === "basics" ? "active-tab" : ""}
                  onClick={async () => {
                    await saveCharacter();
                    setCurrentTab("basics");
                  }}
                >
                  Basics
                </button>
                <button
                  className={currentTab === "page2" ? "active-tab" : ""}
                  onClick={async () => {
                    await saveCharacter();
                    setCurrentTab("page2");
                  }}
                >
                  Page 2
                </button>
                <button
                  className={currentTab === "page3" ? "active-tab" : ""}
                  onClick={async () => {
                    await saveCharacter();
                    setCurrentTab("page3");
                  }}
                >
                  Spells
                </button>
              </div>

              {currentTab === "basics" && (
                <BasicsTab
                  formData={selectedCharacter}
                  handleChange={handleFormChange}
                  setFormData={setSelectedCharacter}
                />
              )}
              {currentTab === "page2" && (
                <PageTwo
                  formData={selectedCharacter}
                  handleChange={handleFormChange}
                  setFormData={setSelectedCharacter}
                />
              )}
              {currentTab === "page3" && (
                <PageThree
                  formData={selectedCharacter}
                  handleChange={handleFormChange}
                  setFormData={setSelectedCharacter}
                />
              )}

              <button onClick={saveCharacter} className="save-character-btn">
                💾 Save Changes
              </button>
            </div>
          )}
        </div>
      )}

      <aside className="dm-chat-panel">
        <ChatBox
          socket={socket}
          campaignId={campaign._id}
          username={user.username}
          userId={user._id}
        />
      </aside>
    </div>
  );
};

export default PlayerView;
