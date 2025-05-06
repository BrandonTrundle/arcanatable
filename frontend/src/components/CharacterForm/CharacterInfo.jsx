import React from "react";
import InputGroup from "./InputGroup";

const CharacterInfo = ({ formData, handleChange }) => (
  <div className="sheet-section basics-header-grid">
    <InputGroup
      label="Character Name"
      name="charname"
      value={formData.charname}
      onChange={handleChange}
    />
    <InputGroup
      label="Class"
      name="class"
      value={formData.class}
      onChange={handleChange}
    />
    <InputGroup
      label="Level"
      name="level"
      type="number"
      value={formData.level || 1}
      onChange={handleChange}
    />
    <InputGroup
      label="Background"
      name="background"
      value={formData.background}
      onChange={handleChange}
    />
    <InputGroup
      label="Player Name"
      name="playername"
      value={formData.playername}
      onChange={handleChange}
    />
    <InputGroup
      label="Race"
      name="race"
      value={formData.race}
      onChange={handleChange}
    />
    <InputGroup
      label="Alignment"
      name="alignment"
      value={formData.alignment}
      onChange={handleChange}
    />
    <InputGroup
      label="Experience Points"
      name="experiencepoints"
      type="number"
      value={formData.experiencepoints}
      onChange={handleChange}
    />
  </div>
);

export default CharacterInfo;
