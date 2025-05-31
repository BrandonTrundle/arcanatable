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
import PlayerMusicPanel from "../Session/PlayerComponents/PlayerMusicPanel";

const PlayerView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [isCombatMode, setIsCombatMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [activeMap, setActiveMap] = useState(sessionMap || null);
  const [activeInteractionMode, setActiveInteractionMode] = useState("select");
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentTab, setCurrentTab] = useState("basics");
  const [tokens, setTokens] = useState([]);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);

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
    const handleCombatModeUpdate = ({ isCombatMode }) => {
      setIsCombatMode(isCombatMode);
      //    console.log("⚔️ Combat mode updated:", isCombatMode);
    };

    socket.on("combatModeUpdate", handleCombatModeUpdate);
    return () => {
      socket.off("combatModeUpdate", handleCombatModeUpdate);
    };
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

  useEffect(() => {
    if (!socket) return;

    const handleIncomingTrack = ({ campaignId, track }) => {
      if (campaignId === campaign._id) {
        if (audioInstance) {
          audioInstance.pause();
        }

        const audio = new Audio(track.url);
        audio.volume = volume;
        audio.play();

        setAudioInstance(audio);
        setCurrentTrack(track);
      }
    };

    socket.on("music:play", handleIncomingTrack);

    return () => {
      socket.off("music:play", handleIncomingTrack);
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [socket, campaign._id, audioInstance, volume]);

  useEffect(() => {
    const handleStop = ({ campaignId }) => {
      if (campaignId === campaign._id) {
        if (audioInstance) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
          setAudioInstance(null);
        }
        setCurrentTrack(null);
      }
    };

    socket.on("music:stop", handleStop);
    return () => socket.off("music:stop", handleStop);
  }, [socket, campaign._id, audioInstance]);

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
      {isCombatMode && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#a00",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 999,
            boxShadow: "0 0 8px #000",
          }}
        >
          ⚔️ Combat Mode Active
        </div>
      )}

      <aside className={`dm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <Toolbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveTool={(tool) => {
            if (selectedCharacter) saveCharacter();
            setSelectedCharacter(null);
            setActiveTool((prev) => (prev === tool ? null : tool));
          }}
          setShowDiceRoller={setShowDiceRoller}
        />
      </aside>

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

      {showDiceRoller && (
        <DicePanel
          userId={user._id}
          campaignId={campaign._id}
          username={user.username}
          socket={socket}
          onClose={() => setShowDiceRoller(false)}
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
      <MapArea
        activeMap={activeMap}
        socket={socket}
        user={user}
        activeInteractionMode={activeInteractionMode}
        setActiveInteractionMode={setActiveInteractionMode}
        selectedTokenId={selectedTokenId}
        setSelectedTokenId={setSelectedTokenId}
        showTokenInfo={showTokenInfo}
        campaignId={campaign._id}
        gridVisible={gridVisible}
      />

      <ChatPanel
        socket={socket}
        campaignId={campaign._id}
        username={user.username}
        userId={user._id}
      />

      <PlayerMusicPanel
        currentTrack={currentTrack}
        volume={volume}
        setVolume={setVolume}
      />
      <button
        onClick={() => setShowTokenInfo((prev) => !prev)}
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          padding: "6px 12px",
          background: "#333",
          color: "white",
          borderRadius: "6px",
          border: "none",
          zIndex: 1000,
        }}
      >
        {showTokenInfo ? "🧷 Hide Token Info" : "🧷 Show Token Info"}
      </button>
      <button
        onClick={() => setGridVisible((prev) => !prev)}
        style={{
          position: "absolute",
          bottom: "50px",
          left: "10px",
          padding: "6px 12px",
          background: "#333",
          color: "white",
          borderRadius: "6px",
          border: "none",
          zIndex: 1000,
        }}
      >
        {gridVisible ? "🧮 Hide Grid" : "🧮 Show Grid"}
      </button>
    </div>
  );
};

export default PlayerView;
