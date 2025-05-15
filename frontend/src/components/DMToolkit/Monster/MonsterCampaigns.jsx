import React from "react";

const MonsterCampaigns = ({
  monster,
  campaigns,
  assignCampaign,
  removeCampaign,
}) => {
  return (
    <div className="monster-campaigns">
      <select
        onChange={(e) => {
          const selected = e.target.value;
          if (selected) {
            assignCampaign(monster._id, selected);
          }
        }}
        defaultValue=""
      >
        <option value="" disabled>
          Assign to Campaign
        </option>
        {campaigns.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      {monster.campaigns?.length > 0 && (
        <ul className="assigned-campaigns">
          {monster.campaigns.map((campId, idx) => {
            const campaign = campaigns.find((c) => c._id === campId);
            return (
              <li key={idx}>
                {campaign?.name || "Unknown"}
                <button
                  className="remove-campaign-btn"
                  onClick={() => removeCampaign(monster._id, campId)}
                  title={`Remove ${campaign?.name || "Unknown"}`}
                >
                  ✖
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MonsterCampaigns;
