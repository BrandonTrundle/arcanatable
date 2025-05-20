import React from "react";
import TokenManager from "../Tokens/TokenManager";
import MapLoaderPanel from "../Maps/MapLoaderPanel";
import DiceRoller from "../../SharedComponents/DiceRoller";
import CampaignNPCListPanel from "../NPC/CampaignNPCListPanel";
import CampaignMonsterListPanel from "../NPC/CampaignMonsterListPanel";
import NPCPreview from "../../../DMToolkit/NPCPreview";
import MonsterPreview from "../../../DMToolkit/Monster/MonsterPreview";
import CombatTrackerPanel from "../CombatTracker/CombatTrackerPanel"; // Adjust path if needed
import TokenInfoPanel from "../UI/TokenInfoPanel";

const DMPanelManager = ({
  activeTool,
  user,
  campaign,
  socket,
  saveCurrentMap,
  setActiveTool,
  selectedNPC,
  setSelectedNPC,
  selectedMonster,
  setSelectedMonster,
  isCombatMode,
  setIsCombatMode,
  focusedToken,
  setFocusedToken,
  useRolledHP,
  setUseRolledHP,

  // 👇 New props passed from DMView
  combatState,
  setInitiative,
  autoRollInitiative,
  updateHP,
  addCondition,
  removeCondition,
}) => {
  //console.log("📦 DMPanelManager focusedToken:", focusedToken);

  return (
    <>
      {activeTool === "tokens" && (
        <TokenManager
          token={user.token}
          campaign={campaign}
          setActiveTool={setActiveTool}
          useRolledHP={useRolledHP}
          setUseRolledHP={setUseRolledHP}
        />
      )}

      {activeTool === "maps" && (
        <div className="dm-maps-panel">
          <MapLoaderPanel
            campaign={campaign}
            socket={socket}
            saveCurrentMap={saveCurrentMap}
          />
        </div>
      )}

      {activeTool === "dice" && (
        <div className="dice-panel">
          <DiceRoller
            userId={user._id}
            campaignId={campaign._id}
            username={user.username}
            isDM={true}
            socket={socket}
          />
        </div>
      )}

      {activeTool === "npcs" && (
        <div className="floating-npc-panel" style={floatingStyle(660)}>
          <CampaignNPCListPanel
            campaignName={campaign.name}
            onSelect={setSelectedNPC}
          />
        </div>
      )}

      {activeTool === "creatures" && (
        <div className="floating-npc-panel" style={floatingStyle(600)}>
          <CampaignMonsterListPanel
            campaignId={campaign._id}
            campaignName={campaign.name}
            onSelect={setSelectedMonster}
          />
        </div>
      )}

      {activeTool === "combat" && combatState?.combatants && (
        <CombatTrackerPanel
          onClose={() => setActiveTool(null)}
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

      {selectedNPC && (
        <div className="floating-preview-panel">
          <button
            className="close-preview-btn"
            onClick={() => setSelectedNPC(null)}
          >
            ✖
          </button>
          <NPCPreview data={selectedNPC} />
        </div>
      )}

      {focusedToken && (
        <>
          <TokenInfoPanel
            token={focusedToken}
            onClose={() => setFocusedToken(null)}
          />
        </>
      )}

      {selectedMonster && (
        <div className="floating-preview-panel">
          <button
            className="close-preview-btn"
            onClick={() => setSelectedMonster(null)}
          >
            ✖
          </button>
          <MonsterPreview data={selectedMonster} />
        </div>
      )}
    </>
  );
};

const floatingStyle = (width) => ({
  position: "fixed",
  top: "10%",
  left: "calc(15% + 60px)",
  width: `${width}px`,
  maxHeight: "80vh",
  overflowY: "auto",
  zIndex: 900,
  backgroundColor: "rgba(255,250,240,0.98)",
  borderRadius: "16px",
  boxShadow: "0 0 20px #0003",
  padding: "1.5rem",
});

export default DMPanelManager;
