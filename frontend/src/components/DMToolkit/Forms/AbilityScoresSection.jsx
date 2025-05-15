import React from "react";

const AbilityScoresSection = ({ scores, onChange }) => {
  return (
    <>
      <h3>Ability Scores</h3>
      {Object.keys(scores).map((attr) => (
        <div key={attr}>
          <label>{attr.toUpperCase()}</label>
          <input
            value={scores[attr]}
            onChange={(e) => onChange("abilityScores", attr, e.target.value)}
          />
        </div>
      ))}
    </>
  );
};

export default AbilityScoresSection;
