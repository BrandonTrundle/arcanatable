import React, { useEffect, useState } from "react";
import MonsterPreview from "../../../DMToolkit/MonsterPreview";
import { fetchMonsters } from "../../../../services/monsterService";
import "../../../../styles/MonsterManager.css"; // Reuse styling

const CampaignMonsterListPanel = ({ campaignName, onSelect }) => {
  const [monsters, setMonsters] = useState([]);

  useEffect(() => {
    const fetchCampaignMonsters = async () => {
      try {
        const data = await fetchMonsters();
        console.log("📋 All fetched monsters:", data);

        const campaignMonsters = data
          .filter((mon) => mon.content?.campaigns?.includes(campaignName))
          .map((mon) => ({
            _id: mon._id,
            ...mon.content,
          }));

        console.log("📋 Matched to campaign:", campaignMonsters);
        setMonsters(campaignMonsters);
      } catch (err) {
        console.error("❌ Failed to fetch monsters:", err);
      }
    };

    if (campaignName) {
      fetchCampaignMonsters();
    }
  }, [campaignName]);

  return (
    <div className="npc-manager-container">
      <h3>Monsters for {campaignName}</h3>
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
