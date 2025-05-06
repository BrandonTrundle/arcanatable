import React from "react";
import "../../styles/CharacterSheetStyles/AbilityBlock.css";

const AbilityBlock = ({
  label,
  scoreName,
  modName,
  scoreValue,
  modValue,
  onChange,
}) => (
  <div className="ability-block-wrapper">
    <div className="ability-block-frame">
      <div className="ability-label">{label.toUpperCase()}</div>
      <input
        type="number"
        name={scoreName}
        value={scoreValue}
        onChange={onChange}
        className="ability-score-input"
      />
      <input
        type="number"
        name={modName}
        value={modValue}
        onChange={onChange}
        className="ability-mod-input"
      />
    </div>
  </div>
);

export default AbilityBlock;
