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

const DMView = ({ campaign, socket, sessionMap }) => {
  const { user } = useContext(UserContext);
  const [useRolledHP, setUseRolledHP] = useState(false);

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
      />

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
    </div>
  );
};

export default DMView;
