import React from "react";

const CrAndProficiencySection = ({ monster, onChange }) => {
  return (
    <>
      <h3>Challenge & Proficiency</h3>
      <label>Challenge Rating</label>
      <input
        value={monster.challengeRating}
        onChange={(e) => onChange("challengeRating", e.target.value)}
      />

      <label>Proficiency Bonus</label>
      <input
        value={monster.proficiencyBonus}
        onChange={(e) => onChange("proficiencyBonus", e.target.value)}
      />
    </>
  );
};

export default CrAndProficiencySection;
