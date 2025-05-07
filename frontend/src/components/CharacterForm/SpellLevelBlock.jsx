import React from "react";
import "../../styles/CharacterSheetStyles/Spellcasting.css";

const SpellLevelBlock = ({ levelData, onChange, levelIndex }) => {
  const handleSpellChange = (e, spellIndex) => {
    const { name, value } = e.target;
    onChange(levelIndex, spellIndex, name, value);
  };

  const handleSlotChange = (e) => {
    const { name, value } = e.target;
    onChange(levelIndex, null, name, value);
  };

  return (
    <div className="spell-level-block">
      <h3>Level {levelData.level === 0 ? "Cantrips" : levelData.level}</h3>

      {levelData.level !== 0 && (
        <div className="slots-row">
          <label>
            Slots Max:
            <input
              type="number"
              name="slotsMax"
              value={levelData.slotsMax || 0}
              onChange={handleSlotChange}
            />
          </label>
          <label>
            Slots Used:
            <input
              type="number"
              name="slotsUsed"
              value={levelData.slotsUsed || 0}
              onChange={handleSlotChange}
            />
          </label>
        </div>
      )}

      <ul className="spells-list">
        {levelData.spells.map((spell, i) => (
          <li key={i}>
            <input
              type="text"
              name="name"
              value={spell.name}
              placeholder="Spell Name"
              onChange={(e) => handleSpellChange(e, i)}
            />
            <input
              type="text"
              name="desc"
              value={spell.desc}
              placeholder="Description"
              onChange={(e) => handleSpellChange(e, i)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpellLevelBlock;
