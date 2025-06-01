import React, { useContext, useState, useEffect, useRef } from "react";
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
import DMConnectedPlayerCards from "../Session/DMComponents/ConnectedPlayers/DMConnectedPlayerCards";

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
  const audioRef = useRef(null);
  const [pendingTrack, setPendingTrack] = useState(null);
  const [hasConsentedToMusic, setHasConsentedToMusic] = useState(false);
  const consentRef = useRef(false);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [showPlayerCards, setShowPlayerCards] = useState(true);

  useEffect(() => {
    if (sessionMap) setActiveMap(sessionMap);
  }, [sessionMap]);

  useEffect(() => {
    if (!socket) return;

    const handleConnectedPlayers = (players) => {
      setConnectedPlayers((prev) => {
        const same = JSON.stringify(prev) === JSON.stringify(players);
        return same ? prev : players;
      });
    };

    socket.on("players:connected", handleConnectedPlayers);

    return () => {
      socket.off("players:connected", handleConnectedPlayers);
    };
  }, [socket]);

  useEffect(() => {
    consentRef.current = hasConsentedToMusic;
  }, [hasConsentedToMusic]);

  useEffect(() => {
    if (campaign?._id && socket) {
      socket.emit("joinRoom", campaign._id);
    }
  }, [campaign?._id, socket]);

  useEffect(() => {
    if (user && socket && campaign?._id) {
      console.log("📡 Registering user...");
      socket.emit("registerUser", {
        userId: user._id,
        campaignId: campaign._id,
        username: user.username,
        avatarUrl: user.avatarUrl || "/default-avatar.png",
      });

      // 🔁 Ask the DM what’s currently playing
      socket.emit("requestCurrentTrack", {
        campaignId: campaign._id,
      });
    }
  }, [user, socket, campaign?._id]);

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

    const handleIncomingTrack = ({ campaignId, track, startedAt }) => {
      console.log("🎵 Incoming track:", { campaignId, track, startedAt });

      if (campaignId !== campaign._id) return;

      if (consentRef.current) {
        playTrack(track, startedAt); // ✅ auto-play
      } else if (!pendingTrack) {
        setPendingTrack({ track, startedAt }); // ❓ prompt
      }
    };

    socket.on("music:play", handleIncomingTrack);

    return () => {
      socket.off("music:play", handleIncomingTrack);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [socket, campaign._id]);

  const playPendingTrack = () => {
    if (!pendingTrack) return;

    const { track, startedAt } = pendingTrack;
    setHasConsentedToMusic(true); // ✅ mark consent

    playTrack(track, startedAt);
    setPendingTrack(null);
  };

  const playTrack = (track, startedAt) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(track.url);
    audio.muted = true;

    const now = Date.now();
    const elapsed = startedAt ? (now - startedAt) / 1000 : 0;

    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      const seekTime = Math.min(elapsed, duration - 0.5);
      console.log("⏱️ Adjusted seekTime:", seekTime, "of", duration);
      audio.currentTime = seekTime;
    });

    audioRef.current = audio;

    audio
      .play()
      .then(() => {
        if (audio.paused) {
          console.warn("🔇 Playback was blocked despite .play() resolving.");
          return;
        }

        console.log("✅ Playback confirmed (muted), fading in...");
        audio.muted = false;
        setCurrentTrack(track);

        let step = 0.05;
        const fadeIn = setInterval(() => {
          if (!audioRef.current) {
            clearInterval(fadeIn);
            return;
          }

          const vol = Math.min(audio.volume + step, volume);
          audio.volume = vol;

          if (vol >= volume || volume === 0) {
            clearInterval(fadeIn);
            console.log("🔊 Volume fade-in complete:", vol);

            console.log("🎧 Audio final state:", {
              currentTime: audio.currentTime,
              volume: audio.volume,
              paused: audio.paused,
              ended: audio.ended,
              duration: audio.duration,
            });
          }
        }, 100);
      })
      .catch((err) => {
        console.warn("🔇 Playback failed:", err);
      });
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const handleStop = ({ campaignId }) => {
      if (campaignId === campaign._id) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        setCurrentTrack(null);
      }
    };

    socket.on("music:stop", handleStop);
    return () => socket.off("music:stop", handleStop);
  }, [socket, campaign._id]);

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

      {showPlayerCards && (
        <DMConnectedPlayerCards
          players={connectedPlayers}
          onSendMessage={(player) => console.log("Message:", player)}
          currentUserId={user?._id}
        />
      )}

      <PlayerMusicPanel
        currentTrack={currentTrack}
        volume={volume}
        setVolume={setVolume}
      />
      {pendingTrack && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6)",
            zIndex: 2000,
          }}
        >
          🎵 Music is playing! Would you like to listen?
          <button
            onClick={() => playPendingTrack()}
            style={{
              marginLeft: "12px",
              background: "#4caf50",
              border: "none",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✅ Yes
          </button>
          <button
            onClick={() => setPendingTrack(null)}
            style={{
              marginLeft: "8px",
              background: "#aaa",
              border: "none",
              color: "black",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ❌ No
          </button>
        </div>
      )}

      <button
        onClick={() => setShowPlayerCards((prev) => !prev)}
        style={{
          position: "absolute",
          bottom: "90px",
          left: "10px",
          padding: "6px 12px",
          background: "#333",
          color: "white",
          borderRadius: "6px",
          border: "none",
          zIndex: 1000,
        }}
      >
        {showPlayerCards ? "🙈 Hide Users" : "🧑‍🤝‍🧑 Show Users"}
      </button>

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
