import React from "react";
import "../../styles/CharacterSheetStyles/BackstoryAndExtras.css";

const BackstoryAndExtras = ({ formData, handleChange }) => {
  const treasureString = (formData.treasure || []).join("\n");

  const handleTreasureChange = (e) => {
    const lines = e.target.value.split("\n");
    handleChange({
      target: {
        name: "treasure",
        value: lines,
      },
    });
  };

  return (
    <div className="backstory-extras-container">
      <div className="backstory-box">
        <label>Character Backstory</label>
        <textarea
          name="backstory"
          value={formData.backstory || ""}
          onChange={handleChange}
          rows={20}
        />
      </div>

      <div className="extras-column">
        <div className="features-box">
          <label>Additional Features & Traits</label>
          <textarea
            name="additionalFeatures"
            value={formData.additionalFeatures || ""}
            onChange={handleChange}
            rows={10}
          />
        </div>

        <div className="treasure-box">
          <label>Treasure</label>
          <textarea
            name="treasure"
            value={treasureString}
            onChange={handleTreasureChange}
            rows={8}
          />
        </div>
      </div>
    </div>
  );
};

export default BackstoryAndExtras;
