import React from "react";
import "../../styles/CharacterSheetStyles/CharacterBanner.css";

const CharacterBanner = ({ formData, handleChange }) => (
  <div className="character-banner">
    <div className="banner-bg">
      <input
        type="text"
        name="charname"
        value={formData.charname || ""}
        onChange={handleChange}
        className="banner-input"
        placeholder="Character Name"
      />
    </div>
  </div>
);

export default CharacterBanner;
