import React, { useState } from "react";
import TokenManager from "../Tokens/TokenManager";
import MapLoaderPanel from "../Maps/MapLoaderPanel";
import DiceRoller from "../../SharedComponents/DiceRoller";
import CampaignNPCListPanel from "../NPC/CampaignNPCListPanel";
import CampaignMonsterListPanel from "../NPC/CampaignMonsterListPanel";
import NPCPreview from "../../../DMToolkit/NPCPreview";
import MonsterPreview from "../../../DMToolkit/Monster/MonsterPreview";
import CombatTrackerPanel from "../CombatTracker/CombatTrackerPanel"; // Adjust path if needed
import TokenInfoPanel from "../UI/TokenInfoPanel";
import DMCharacterPanel from "../CharacterSheets/DMCharacterPanel";
import CharacterSheetPanel from "../../PlayerComponents/CharacterSheetPanel";
import DMCharacterSheetPanel from "./DMCharacterSheetPanel";

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
  const liveToken =
    combatState.combatants.find((c) => c.tokenId === focusedToken?.id) ??
    focusedToken;
  const [selectedDMCharacter, setSelectedDMCharacter] = useState(null);
  const [dmCurrentTab, setDMCurrentTab] = useState("basics");

  const handleDMFormChange = (e) => {
    const { name, type, value, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setSelectedDMCharacter((prev) => {
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

  const saveDMCharacter = async () => {
    if (!selectedDMCharacter?._id) return;

    try {
      const formDataToSend = new FormData();

      // Prepare image URLs (we won't upload new files from DM view right now)
      const updatedPortraitImage = selectedDMCharacter.portraitImage ?? "";
      const updatedOrgSymbolImage = selectedDMCharacter.orgSymbolImage ?? "";

      for (const [key, value] of Object.entries(selectedDMCharacter)) {
        if (
          [
            "portraitImageFile",
            "portraitImagePreview",
            "orgSymbolImageFile",
            "orgSymbolImagePreview",
          ].includes(key)
        ) {
          continue; // skip client-side only fields
        }

        // Convert nested objects to JSON
        if (typeof value === "object" && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value ?? "");
        }
      }

      formDataToSend.set("portraitImage", String(updatedPortraitImage));
      formDataToSend.set("orgSymbolImage", String(updatedOrgSymbolImage));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters/${
          selectedDMCharacter._id
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Update failed:", err.message);
      } else {
        const updated = await res.json();
        setSelectedDMCharacter(updated); // Keep state in sync
      }
    } catch (err) {
      console.error("❌ Error saving character:", err);
    }
  };

  const floatingStyle = (top) => ({
    position: "fixed",
    top: `${top}px`,
    left: "250px",
    zIndex: 9999,
    width: "700px",
  });

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

      {activeTool === "npcs" && (
        <div className="floating-npc-panel" style={floatingStyle(0)}>
          <CampaignNPCListPanel
            campaignName={campaign.name}
            onSelect={setSelectedNPC}
          />
        </div>
      )}

      {activeTool === "creatures" && (
        <div className="floating-npc-panel" style={floatingStyle(0)}>
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

      {activeTool === "players" && (
        <DMCharacterSheetPanel
          campaignId={campaign._id}
          setActiveTool={setActiveTool}
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
        <TokenInfoPanel
          token={liveToken}
          onClose={() => setFocusedToken(null)}
        />
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

export default DMPanelManager;
