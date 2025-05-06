import React from "react";
import "../../styles/CharacterSheetStyles/CharacterStatsBlock.css";

const fields = [
  ["age", "height", "weight"],
  ["eyes", "skin", "hair"],
];

const CharacterStatsBlock = ({ formData, handleChange }) => (
  <div className="character-stats-block">
    {fields.map((row, i) => (
      <div className="stats-row" key={i}>
        {row.map((field) => (
          <div className="stats-cell" key={field}>
            <label>{field.toUpperCase()}</label>
            <input
              type="text"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default CharacterStatsBlock;
