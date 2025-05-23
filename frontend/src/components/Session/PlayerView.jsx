import React, { useContext, useState, useEffect } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import { UserContext } from "../../context/UserContext";

import Toolbar from "./PlayerComponents/PlayerToolbar";
import MapArea from "./PlayerComponents/MapArea";
import TokenPanel from "./PlayerComponents/TokenPanel";
import DicePanel from "./PlayerComponents/DicePanel";
import CharacterSheetPanel from "./PlayerComponents/CharacterSheetPanel";
import ChatPanel from "./PlayerComponents/ChatPanel";
import RefactoredMap from "./DMComponents/Maps/RefactoredMap";
import InteractionToolbar from "./DMComponents/UI/InteractionToolbar";

const PlayerView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [activeMap, setActiveMap] = useState(sessionMap || null);
  const [activeInteractionMode, setActiveInteractionMode] = useState("select");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentTab, setCurrentTab] = useState("basics");

  useEffect(() => {
    if (sessionMap) setActiveMap(sessionMap);
  }, [sessionMap]);

  useEffect(() => {
    if (campaign?._id && socket) {
      socket.emit("joinRoom", campaign._id);
    }
  }, [campaign?._id, socket]);

  useEffect(() => {
    if (user && socket) {
      socket.emit("registerUser", {
        userId: user._id,
        campaignId: campaign._id,
      });
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
          `${import.meta.env.VITE_API_URL}/api/sessionstate/${
            campaign._id
          }/current-map`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const { mapId } = await sessionRes.json();
        if (!mapId) return;

        const mapRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${mapId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const map = await mapRes.json();
        setActiveMap(map);
      } catch (err) {
        console.error("❌ Failed to fetch map for player:", err);
      }
    };

    fetchCurrentMap();
  }, [campaign._id]);

  const handleFormChange = (e) => {
    const { name, type, value, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setSelectedCharacter((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: val,
          },
        };
      }

      return { ...prev, [name]: val };
    });
  };
  const saveCharacter = async () => {
    if (!selectedCharacter) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters/${
          selectedCharacter._id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(selectedCharacter),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to save character:", err.message);
        return false;
      }

      // console.log("✅ Character auto-saved");
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

      <RefactoredMap
        map={activeMap}
        socket={socket}
        user={user}
        activeLayer="player"
        activeInteractionMode={activeInteractionMode}
        setActiveInteractionMode={setActiveInteractionMode}
        selectedTokenId={selectedTokenId}
        setSelectedTokenId={setSelectedTokenId}
      />

      {activeTool === "tokens" && (
        <TokenPanel
          campaignId={campaign._id}
          userToken={user.token}
          onClose={() => setActiveTool(null)}
        />
      )}

      {selectedTokenId && (
        <InteractionToolbar
          activeMode={activeInteractionMode}
          setActiveMode={setActiveInteractionMode}
        />
      )}

      {activeTool === "dice" && (
        <DicePanel
          userId={user._id}
          campaignId={campaign._id}
          username={user.username}
          socket={socket}
        />
      )}

      {activeTool === "character-sheet" && (
        <CharacterSheetPanel
          campaignId={campaign._id}
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          saveCharacter={saveCharacter}
          handleFormChange={handleFormChange}
          setActiveTool={setActiveTool}
        />
      )}

      <ChatPanel
        socket={socket}
        campaignId={campaign._id}
        username={user.username}
        userId={user._id}
      />
    </div>
  );
};

export default PlayerView;
