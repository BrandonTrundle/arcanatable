import React, { useEffect, useState } from "react";
import NPCPreview from "../../../DMToolkit/NPCPreview"; // Adjust path as needed
import "../../../../styles/DMToolkit/NPCManager.css"; // You may want to split this later
import { fetchNPCs } from "../../../../services/npcService";

const CampaignNPCListPanel = ({ campaignName, onSelect }) => {
  const [npcs, setNpcs] = useState([]);
  const [selectedNPC, setSelectedNPC] = useState(null);

  useEffect(() => {
    const fetchCampaignNPCs = async () => {
      try {
        const data = await fetchNPCs();
        // console.log("📋 All fetched NPCs:", data);
        // console.log("📋 Filtering for campaign:", campaignName);

        const campaignNPCs = data
          .filter((npc) => npc.content?.campaigns?.includes(campaignName))
          .map((npc) => ({
            _id: npc._id,
            ...npc.content,
          }));

        //   console.log("📋 NPCs matched to campaign:", campaignNPCs);

        setNpcs(campaignNPCs);
      } catch (err) {
        console.error("❌ Failed to fetch NPCs:", err);
      }
    };

    if (campaignName) {
      fetchCampaignNPCs();
    }
  }, [campaignName]);

  return (
    <div className="npc-manager-container">
      <h3>NPCs for {campaignName}</h3>
      <ul className="npc-list">
        {npcs.map((npc) => (
          <li key={npc._id} className="npc-list-item">
            <span className="npc-name" onClick={() => onSelect(npc)}>
              {npc.name}
            </span>
          </li>
        ))}
      </ul>

      {selectedNPC && (
        <div className="npc-preview-wrapper">
          <NPCPreview data={selectedNPC} />
        </div>
      )}
    </div>
  );
};

export default CampaignNPCListPanel;
