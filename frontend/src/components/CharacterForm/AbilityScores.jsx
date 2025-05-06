import React from "react";
import AbilityBlock from "./AbilityBlock";

const AbilityScores = ({ formData, handleChange }) => (
  <div className="ability-scores">
    {[
      { short: "str", label: "Strength" },
      { short: "dex", label: "Dexterity" },
      { short: "con", label: "Constitution" },
      { short: "int", label: "Intelligence" },
      { short: "wis", label: "Wisdom" },
      { short: "cha", label: "Charisma" },
    ].map(({ short, label }) => (
      <AbilityBlock
        key={short}
        label={label}
        scoreName={`${short}score`}
        modName={`${short}mod`}
        scoreValue={formData[`${short}score`] || 0}
        modValue={formData[`${short}mod`] || 0}
        onChange={handleChange}
      />
    ))}
  </div>
);

export default AbilityScores;
