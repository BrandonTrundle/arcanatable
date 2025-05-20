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

const DMView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [useRolledHP, setUseRolledHP] = useState(false);
  const [showCombatTracker, setShowCombatTracker] = useState(true);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

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

  const {
    combatState,
    setCombatState, // ✅ ADD THIS
    initializeCombat,
    syncCombatantsWithTokens,
    setInitiative,
    autoRollInitiative,
    nextTurn,
    updateHP,
    addCondition,
    removeCondition,
  } = useCombatTracker();

  useEffect(() => {
    // console.log("🧠 Combat state updated:", combatState);
  }, [combatState]);

  const { activeMap, setActiveMap, tokens, setTokens, saveCurrentMap } =
    useDMMapManager(sessionMap, socket, user);

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
    // console.log("🧭 DMView: Combat mode changed:", isCombatMode);
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
      //console.log("🧼 Clearing combatState because tokens are empty");
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
        />
      </aside>

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
      />

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
    </div>
  );
};

export default DMView;
