import React, { useEffect, useState } from "react";
import MonsterPreview from "../../../../components/DMToolkit/Monster/MonsterPreview";
import { fetchMonsters } from "../../../../services/monsterService";
import "../../../../styles/MonsterManager.css"; // Reuse styling

const CampaignMonsterListPanel = ({
  campaignId,
  campaignName = "",
  onSelect,
}) => {
  const [monsters, setMonsters] = useState([]);

  useEffect(() => {
    const fetchCampaignMonsters = async () => {
      try {
        const data = await fetchMonsters();
        //  console.log("📋 All fetched monsters:", data);

        const campaignMonsters = data
          .filter((mon) => mon.content?.campaigns?.includes(campaignId))
          .map((mon) => ({
            _id: mon._id,
            ...mon.content,
          }));

        // console.log("📋 Matched to campaign:", campaignMonsters);
        setMonsters(campaignMonsters);
      } catch (err) {
        console.error("❌ Failed to fetch monsters:", err);
      }
    };

    if (campaignId) {
      fetchCampaignMonsters();
    }
  }, [campaignId]);

  return (
    <div className="npc-manager-container">
      <h3>Monsters for {campaignName || campaignId}</h3>
      <ul className="npc-list">
        {monsters.map((mon) => (
          <li key={mon._id} className="npc-list-item">
            <span className="npc-name" onClick={() => onSelect(mon)}>
              {mon.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignMonsterListPanel;
