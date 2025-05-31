import React, { useContext, useEffect, useState } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";

import { UserContext } from "../../context/UserContext";
import ChatBox from "../Session/SharedComponents/ChatBox";
import DMToolbar from "./DMComponents/UI/DMToolbar";
import InteractionToolbar from "../Session/DMComponents/UI/InteractionToolbar";

import useDMViewState from "../Session/hooks/useDMViewState";
import useDMMapManager from "../Session/hooks/useDMMapManager";
import DMPanelManager from "../Session/DMComponents/UI/DMPanelManager";
import DMMapDisplay from "../Session/DMComponents/UI/DMMapDisplay";
import useCombatTracker from "../Session/DMComponents/CombatTracker/hooks/useCombatTracker";
import CombatTrackerPanel from "../Session/DMComponents/CombatTracker/CombatTrackerPanel";
import DiceRoller from "../Session/SharedComponents/DiceRoller";
import FloatingMusicPlayer from "../Session/Music/FloatingMusicPlayer";
import MusicPanel from "../Session/DMComponents/UI/MusicPanel";

const DMView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [useRolledHP, setUseRolledHP] = useState(false);
  const [showCombatTracker, setShowCombatTracker] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playlist, setPlaylist] = useState([]);
  const [trackStartedAt, setTrackStartedAt] = useState(null);

  const {
    sidebarOpen,
    setSidebarOpen,
    activeTool,
    setActiveTool,
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
    isCombatMode,
    setIsCombatMode,
    focusedToken,
    setFocusedToken,
  } = useDMViewState();

  // 🟢 MUST COME FIRST so `activeMap` is available for the next hook
  const { activeMap, setActiveMap, tokens, setTokens, saveCurrentMap } =
    useDMMapManager(sessionMap, socket, user);

  // 🟢 Now it's safe to use `activeMap?._id` here
  const {
    combatState,
    setCombatState,
    initializeCombat,
    syncCombatantsWithTokens,
    setInitiative,
    autoRollInitiative,
    nextTurn,
    updateHP,
    addCondition,
    removeCondition,
  } = useCombatTracker(socket, activeMap?._id, tokens);

  const handlePlay = (track, index = null) => {
    if (audioInstance) {
      audioInstance.pause();
    }

    const audio = new Audio(track.url);
    audio.volume = volume;
    audio.play();

    audio.addEventListener("ended", () => {
      if (repeat) {
        handlePlay(track, index);
      } else if (index !== null && playlist.length > index + 1) {
        const nextTrack = playlist[index + 1];
        handlePlay(nextTrack, index + 1);
      } else {
        setCurrentTrack(null);
        setCurrentTrackIndex(null);
        if (socket && campaign?._id) {
          socket.emit("music:stop", { campaignId: campaign._id });
        }
      }
    });

    const startedAt = Date.now(); // Local variable
    setAudioInstance(audio);
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setTrackStartedAt(startedAt); // This will still update React state

    // ✅ Immediately emit with local `startedAt` (no async delay!)
    if (socket && campaign?._id) {
      socket.emit("music:play", {
        campaignId: campaign._id,
        track,
        startedAt,
      });
    }
  };

  const handleStop = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
      setCurrentTrack(null);
      setCurrentTrackIndex(null);

      // 📢 Emit stop event to all players
      if (socket && campaign?._id) {
        socket.emit("music:stop", { campaignId: campaign._id });
      }
    }
  };

  useEffect(() => {
    if (!socket || !campaign?._id) return;

    const handleRequestCurrentTrack = ({ campaignId }) => {
      console.log("📥 Received track request for campaign:", campaignId);

      if (campaignId === campaign._id && currentTrack && trackStartedAt) {
        console.log("📤 Sending current track to player:", {
          track: currentTrack,
          startedAt: trackStartedAt,
        });

        socket.emit("music:play", {
          campaignId,
          track: currentTrack,
          startedAt: trackStartedAt,
        });
      } else {
        console.warn("⚠️ No track to send or campaign mismatch");
      }
    };

    socket.on("requestCurrentTrack", handleRequestCurrentTrack);

    return () => {
      socket.off("requestCurrentTrack", handleRequestCurrentTrack);
    };
  }, [socket, campaign?._id, currentTrack, trackStartedAt]);

  useEffect(() => {
    if (audioInstance) {
      console.log("🔊 Updating volume to:", volume);
      audioInstance.volume = volume;
    }
  }, [volume, audioInstance]);

  const handleNext = () => {
    if (
      playlist &&
      currentTrackIndex !== null &&
      currentTrackIndex < playlist.length - 1
    ) {
      const nextIndex = currentTrackIndex + 1;
      handlePlay(playlist[nextIndex], nextIndex);
    }
  };

  const handlePrevious = () => {
    if (playlist && currentTrackIndex !== null && currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      handlePlay(playlist[prevIndex], prevIndex);
    }
  };

  useEffect(() => {
    // console.log("🧠 Combat state updated:", combatState);
  }, [combatState]);

  useEffect(() => {
    if (user && socket) {
      socket.emit("registerUser", {
        userId: user._id,
        campaignId: campaign._id,
      });
    }
  }, [socket, user]);

  useEffect(() => {
    if (socket && campaign?._id) {
      socket.emit("combatModeUpdate", {
        campaignId: campaign._id,
        isCombatMode,
      });
    }
  }, [isCombatMode, socket, campaign?._id]);

  useEffect(() => {
    if (
      isCombatMode &&
      tokens?.length &&
      combatState?.combatants?.length === 0
    ) {
      initializeCombat(tokens);
    }
  }, [isCombatMode, tokens, combatState]);

  useEffect(() => {
    if (!isCombatMode) return;

    if (!Array.isArray(tokens)) return;

    if (tokens.length === 0) {
      setCombatState((prev) => ({ ...prev, combatants: [] }));
      return;
    }

    if (combatState.combatants.length === 0) {
      initializeCombat(tokens);
    } else {
      syncCombatantsWithTokens(tokens);
    }
  }, [
    isCombatMode,
    tokens,
    initializeCombat,
    syncCombatantsWithTokens,
    combatState.combatants.length,
    setCombatState,
  ]);

  return (
    <div className="dm-session-container">
      <aside className={`dm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <DMToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowDiceRoller={setShowDiceRoller}
        />
      </aside>

      <div className="dm-map-wrapper">
        <DMMapDisplay
          activeMap={activeMap}
          user={user}
          socket={socket}
          activeLayer="dm"
          selectedTokenId={selectedTokenId}
          setSelectedTokenId={setSelectedTokenId}
          activeInteractionMode={activeInteractionMode}
          setActiveInteractionMode={setActiveInteractionMode}
          setFocusedToken={setFocusedToken}
          setExternalTokens={setTokens}
          isCombatMode={isCombatMode}
          useRolledHP={useRolledHP}
          showTokenInfo={showTokenInfo}
          combatState={combatState}
          campaignId={campaign._id}
          gridVisible={gridVisible}
        />
      </div>

      {currentTrack && activeTool !== "music" && (
        <FloatingMusicPlayer
          track={currentTrack}
          onNext={handleNext}
          onPrev={handlePrevious}
          onStop={handleStop}
          volume={volume}
          onVolumeChange={setVolume}
          repeat={repeat}
          setRepeat={setRepeat}
        />
      )}

      <DMPanelManager
        activeTool={activeTool}
        user={user}
        campaign={campaign}
        socket={socket}
        saveCurrentMap={saveCurrentMap}
        setActiveTool={setActiveTool}
        selectedNPC={selectedNPC}
        setSelectedNPC={setSelectedNPC}
        selectedMonster={selectedMonster}
        setSelectedMonster={setSelectedMonster}
        isCombatMode={isCombatMode}
        setIsCombatMode={setIsCombatMode}
        focusedToken={focusedToken}
        setFocusedToken={setFocusedToken}
        useRolledHP={useRolledHP}
        setUseRolledHP={setUseRolledHP}
        // 👇 New Props
        combatState={combatState}
        setInitiative={setInitiative}
        autoRollInitiative={autoRollInitiative}
        updateHP={updateHP}
        addCondition={addCondition}
        removeCondition={removeCondition}
        // Music Props
        currentTrack={currentTrack}
        setCurrentTrack={setCurrentTrack}
        audioInstance={audioInstance}
        setAudioInstance={setAudioInstance}
        currentTrackIndex={currentTrackIndex}
        setCurrentTrackIndex={setCurrentTrackIndex}
        repeat={repeat}
        setRepeat={setRepeat}
        volume={volume}
        setVolume={setVolume}
        playlist={playlist}
        setPlaylist={setPlaylist}
        handlePlay={handlePlay}
      />

      {showCombatTracker && (
        <CombatTrackerPanel
          onClose={() => setShowCombatTracker(false)}
          isCombatMode={isCombatMode}
          setIsCombatMode={setIsCombatMode}
          combatState={combatState}
          setInitiative={setInitiative}
          autoRollInitiative={autoRollInitiative}
          updateHP={updateHP}
          addCondition={addCondition}
          removeCondition={removeCondition}
        />
      )}

      {showToolbar && (
        <InteractionToolbar
          activeMode={activeInteractionMode}
          setActiveMode={setActiveInteractionMode}
          className={toolbarExiting ? "exit" : ""}
        />
      )}

      {showDiceRoller && (
        <div className="dice-panel">
          <DiceRoller
            userId={user._id}
            campaignId={campaign._id}
            username={user.username}
            isDM={true}
            socket={socket}
            onClose={() => setShowDiceRoller(false)}
          />
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

export default DMView;
