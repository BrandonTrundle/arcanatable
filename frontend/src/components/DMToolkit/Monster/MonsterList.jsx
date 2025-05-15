import React from "react";

const MonsterList = ({
  monsters,
  selectedMonster,
  onSelect,
  onEdit,
  onDelete,
  renderCampaignControls, // Pass a function: (monster) => JSX
}) => {
  if (!monsters.length) {
    return <p>No monsters yet.</p>;
  }

  return (
    <ul className="monster-list">
      {monsters.map((mon) => (
        <li key={mon._id} className="monster-list-item">
          <div className="monster-info">
            <span
              className="monster-name"
              onClick={() =>
                selectedMonster && selectedMonster._id === mon._id
                  ? onSelect(null)
                  : onSelect(mon)
              }
            >
              {mon.name}
            </span>

            {renderCampaignControls && renderCampaignControls(mon)}
          </div>

          <div className="monster-actions">
            <button onClick={() => onEdit(mon)} className="edit-btn">
              Edit
            </button>
            <button onClick={() => onDelete(mon._id)} className="delete-btn">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MonsterList;
