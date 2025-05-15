import React from "react";

const SkillsSection = ({
  skills,
  onChange,
  onRemove,
  newSkill,
  setNewSkill,
  onAdd,
}) => {
  return (
    <>
      <h3>Skills</h3>
      {Object.entries(skills || {}).map(([key, val]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            value={val}
            onChange={(e) => onChange("skills", key, e.target.value)}
          />
          <button
            onClick={() => onRemove("skills", key)}
            className="remove-btn"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="key-pair-row">
        <input
          type="text"
          placeholder="Skill name (e.g. Stealth)"
          value={newSkill.key}
          onChange={(e) =>
            setNewSkill((prev) => ({ ...prev, key: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Value (e.g. +7)"
          value={newSkill.value}
          onChange={(e) =>
            setNewSkill((prev) => ({ ...prev, value: e.target.value }))
          }
        />
        <button
          onClick={() => {
            if (newSkill.key && newSkill.value) {
              onAdd("skills", newSkill.key, newSkill.value);
              setNewSkill({ key: "", value: "" });
            }
          }}
        >
          Add
        </button>
      </div>
    </>
  );
};

export default SkillsSection;
