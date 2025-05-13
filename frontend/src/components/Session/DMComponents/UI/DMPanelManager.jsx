import React from "react";
import TokenManager from "../Tokens/TokenManager";
import MapLoaderPanel from "../Maps/MapLoaderPanel";
import DiceRoller from "../../SharedComponents/DiceRoller";
import CampaignNPCListPanel from "../NPC/CampaignNPCListPanel";
import CampaignMonsterListPanel from "../NPC/CampaignMonsterListPanel";
import NPCPreview from "../../../DMToolkit/NPCPreview";
import MonsterPreview from "../../../DMToolkit/MonsterPreview";

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
}) => {
  return (
    <>
      {activeTool === "tokens" && (
        <TokenManager
          token={user.token}
          campaign={campaign}
          setActiveTool={setActiveTool}
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
