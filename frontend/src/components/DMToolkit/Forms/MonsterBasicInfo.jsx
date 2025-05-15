import React from "react";

const MonsterBasicInfo = ({ monster, handleChange }) => {
  return (
    <>
      <h3>Basic Info</h3>
      {["name", "type", "alignment", "armorClass", "hitPoints", "hitDice"].map(
        (field) => (
          <div key={field}>
            <label>{field.replace(/([A-Z])/g, " $1")}</label>
            <input
              value={monster[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          </div>
        )
      )}
      <div>
        <label>Size</label>
        <select
          value={monster.size}
          onChange={(e) => handleChange("size", e.target.value)}
        >
          <option value="">-- Select Size --</option>
          <option value="Tiny">Tiny</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
          <option value="Huge">Huge</option>
          <option value="Gargantuan">Gargantuan</option>
        </select>
      </div>
    </>
  );
};

export default MonsterBasicInfo;
