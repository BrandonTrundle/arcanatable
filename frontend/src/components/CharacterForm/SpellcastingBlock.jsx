import React from "react";
import "../../styles/CharacterSheetStyles/Spellcasting.css";

const SpellcastingBlock = ({ formData, handleChange }) => {
  return (
    <div className="spellcasting-block">
      <h2>Spellcasting</h2>
      <div className="spellcasting-fields">
        <label>
          Spellcasting Ability:
          <select
            name="spellcastingAbility"
            value={formData.spellcastingAbility || ""}
            onChange={handleChange}
          >
            <option value="">--Select--</option>
            <option value="STR">Strength</option>
            <option value="DEX">Dexterity</option>
            <option value="CON">Constitution</option>
            <option value="INT">Intelligence</option>
            <option value="WIS">Wisdom</option>
            <option value="CHA">Charisma</option>
          </select>
        </label>
        <label>
          Spell Save DC:
          <input
            type="number"
            name="spellSaveDC"
            value={formData.spellSaveDC || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Spell Attack Bonus:
          <input
            type="number"
            name="spellAttackBonus"
            value={formData.spellAttackBonus || ""}
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
};

export default SpellcastingBlock;
