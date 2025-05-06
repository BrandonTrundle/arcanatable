import React from "react";
import CheckBoxWithBonus from "./CheckBoxWithBonus";

// Correct schema-aligned short names
const savingThrows = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

// Skill list remains the same
const skills = [
  { name: "Acrobatics", stat: "dexterity" },
  { name: "Animal Handling", stat: "wisdom" },
  { name: "Arcana", stat: "intelligence" },
  { name: "Athletics", stat: "strength" },
  { name: "Deception", stat: "charisma" },
  { name: "History", stat: "intelligence" },
  { name: "Insight", stat: "wisdom" },
  { name: "Intimidation", stat: "charisma" },
  { name: "Investigation", stat: "intelligence" },
  { name: "Medicine", stat: "wisdom" },
  { name: "Nature", stat: "intelligence" },
  { name: "Perception", stat: "wisdom" },
  { name: "Performance", stat: "charisma" },
  { name: "Persuasion", stat: "charisma" },
  { name: "Religion", stat: "intelligence" },
  { name: "Sleight of Hand", stat: "dexterity" },
  { name: "Stealth", stat: "dexterity" },
  { name: "Survival", stat: "wisdom" },
];

const BonusSection = ({ formData, handleChange }) => (
  <div className="bonus-section">
    {/* Inspiration */}
    <div className="bonus-box">
      <label>Inspiration</label>
      <input
        type="text"
        name="inspiration"
        value={formData.inspiration || ""}
        onChange={handleChange}
      />
    </div>

    {/* Proficiency Bonus */}
    <div className="bonus-box">
      <label>Proficiency</label>
      <input
        type="number"
        name="proficiencybonus"
        value={formData.proficiencybonus || 0}
        onChange={handleChange}
      />
    </div>

    {/* Saving Throws */}
    <div className="defense-box">
      <h4>Saving Throws</h4>
      {savingThrows.map((stat) => (
        <CheckBoxWithBonus
          key={stat}
          label={stat}
          name={`${stat}-save-prof`} // checkbox field
          checked={formData[`${stat}-save-prof`] || false}
          bonusName={`${stat}-save`} // number input field
          bonusValue={formData[`${stat}-save`] || 0}
          onChange={handleChange}
        />
      ))}
    </div>

    {/* Skills */}
    <div className="defense-box">
      <h4>Skills</h4>
      {skills.map(({ name, stat }) => {
        const existing = formData.skills?.find((s) => s.name === name) || {};
        return (
          <div className="check-input-row" key={name}>
            <input
              type="checkbox"
              name={`skill_prof_${name}`}
              checked={!!existing.proficient}
              onChange={(e) => {
                const updatedSkills = formData.skills
                  ? [...formData.skills]
                  : [];
                const skillIndex = updatedSkills.findIndex(
                  (s) => s.name === name
                );
                const newSkill = {
                  name,
                  stat,
                  mod: existing.mod || 0,
                  proficient: e.target.checked,
                };

                if (skillIndex !== -1) {
                  updatedSkills[skillIndex] = newSkill;
                } else {
                  updatedSkills.push(newSkill);
                }

                // Update formData
                handleChange({
                  target: {
                    name: "skills",
                    value: updatedSkills,
                  },
                });
              }}
            />
            <input
              type="number"
              value={existing.mod || 0}
              onChange={(e) => {
                const updatedSkills = formData.skills
                  ? [...formData.skills]
                  : [];
                const skillIndex = updatedSkills.findIndex(
                  (s) => s.name === name
                );
                const newSkill = {
                  name,
                  stat,
                  proficient: existing.proficient || false,
                  mod: parseInt(e.target.value),
                };

                if (skillIndex !== -1) {
                  updatedSkills[skillIndex] = newSkill;
                } else {
                  updatedSkills.push(newSkill);
                }

                // Update formData
                handleChange({
                  target: {
                    name: "skills",
                    value: updatedSkills,
                  },
                });
              }}
            />
            <label>{`${name} (${stat.charAt(0).toUpperCase()})`}</label>
          </div>
        );
      })}
    </div>

    {/* Passive Wisdom */}
    <div className="bonus-box">
      <label>Passive Wisdom (Perception)</label>
      <input
        type="number"
        name="passiveWisdom"
        value={formData.passiveWisdom || 0}
        onChange={handleChange}
      />
    </div>

    {/* Other Proficiencies & Languages */}
    <div className="defense-box">
      <h4>Other Proficiencies & Languages</h4>
      <textarea
        name="otherProficiencies"
        value={formData.otherProficiencies || ""}
        onChange={handleChange}
        rows={4}
      />
    </div>
  </div>
);

export default BonusSection;
