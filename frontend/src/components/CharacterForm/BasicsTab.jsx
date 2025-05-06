import React from "react";
import "../../styles/CharacterSheetStyles/CharacterSheet.css";
import CharacterInfo from "./CharacterInfo";
import AbilityScores from "./AbilityScores";
import BonusSection from "./BonusSection";
import CombatStats from "./CombatStats";
import PersonalityTraits from "./PersonalityTraits";

const BasicsTab = ({ formData, handleChange, setFormData }) => (
  <div className="tab-content">
    <div className="character-sheet">
      <h2>Character Basics</h2>

      <CharacterInfo formData={formData} handleChange={handleChange} />
      <div className="sheet-section attributes-bonus-wrap">
        <AbilityScores formData={formData} handleChange={handleChange} />
        <BonusSection formData={formData} handleChange={handleChange} />
        <CombatStats
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
        />
        <PersonalityTraits formData={formData} handleChange={handleChange} />
      </div>
    </div>
  </div>
);

export default BasicsTab;
