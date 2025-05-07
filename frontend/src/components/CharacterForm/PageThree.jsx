import React from "react";
import SpellcastingBlock from "./SpellcastingBlock";
import SpellLevelBlock from "./SpellLevelBlock";
import "../../styles/CharacterSheetStyles/CharacterSheet.css";

const PageThree = ({ formData, handleChange, setFormData }) => {
  const spellLevels = formData.spells || [];
  if (spellLevels.length === 0) {
    const defaultSpells = Array.from({ length: 10 }, (_, level) => ({
      level,
      slotsMax: level === 0 ? null : 0,
      slotsUsed: level === 0 ? null : 0,
      spells: Array.from({ length: 10 }, () => ({
        name: "",
        desc: "",
      })),
    }));

    setFormData((prev) => ({
      ...prev,
      spells: defaultSpells,
    }));

    return null; // wait for re-render
  }
  console.log("spells data:", spellLevels);
  const updateSpellLevel = (levelIndex, spellIndex, field, value) => {
    const updatedLevels = [...spellLevels];

    if (spellIndex === null) {
      // Update slots
      updatedLevels[levelIndex][field] = value;
    } else {
      // Update spell field
      updatedLevels[levelIndex].spells[spellIndex] = {
        ...updatedLevels[levelIndex].spells[spellIndex],
        [field]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      spells: updatedLevels,
    }));
  };

  return (
    <div className="page-three">
      <SpellcastingBlock formData={formData} handleChange={handleChange} />
      <div className="spell-levels-container">
        {spellLevels.map((levelData, i) => (
          <SpellLevelBlock
            key={i}
            levelData={levelData}
            onChange={updateSpellLevel}
            levelIndex={i}
          />
        ))}
      </div>
    </div>
  );
};

export default PageThree;
