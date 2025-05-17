import React, { useContext, useEffect } from "react";
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
  } = useDMViewState();

  const { activeMap, setActiveMap, tokens, setTokens, saveCurrentMap } =
    useDMMapManager(sessionMap, socket, user);

  useEffect(() => {
    if (user && socket) {
      socket.emit("registerUser", user._id);
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
        setExternalTokens={setTokens}
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
