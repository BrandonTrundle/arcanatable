import React, { useState } from "react";
import "../../styles/MonsterForm.css";
import axios from "axios";

const MonsterForm = ({ monster, setMonster, closeForm, onSubmit }) => {
  const [newSkill, setNewSkill] = useState({ key: "", value: "" });
  const [newSave, setNewSave] = useState({ key: "", value: "" });
  const [useUpload, setUseUpload] = useState(false);

  const handleChange = (field, value) => {
    setMonster((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setMonster((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleKeyValueChange = (section, key, value) => {
    setMonster((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const removeKeyFromSection = (section, key) => {
    const updated = { ...monster[section] };
    delete updated[key];
    setMonster((prev) => ({ ...prev, [section]: updated }));
  };

  const updateListItem = (field, index, key, value) => {
    const updated = [...monster[field]];
    updated[index][key] = value;
    setMonster((prev) => ({ ...prev, [field]: updated }));
  };

  const addListItem = (field) => {
    const newItem = { name: "", desc: "" };
    setMonster((prev) => ({
      ...prev,
      [field]: [...prev[field], newItem],
    }));
  };

  const removeListItem = (field, index) => {
    const updated = [...monster[field]];
    updated.splice(index, 1);
    setMonster((prev) => ({ ...prev, [field]: updated }));
  };

  return (
    <div className="monster-form-panel">
      <button className="close-btn" onClick={closeForm}>
        ✖
      </button>
      <h2>Monster Details</h2>

      {/* Basic Info */}
      {[
        "name",
        "tokenSize",
        "type",
        "alignment",
        "armorClass",
        "hitPoints",
        "hitDice",
      ].map((field) => (
        <div key={field}>
          <label>{field.replace(/([A-Z])/g, " $1")}</label>
          <input
            value={monster[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        </div>
      ))}

      {/* Speed */}
      <h3>Speed</h3>
      {["walk", "fly", "swim", "climb", "burrow"].map((type) => (
        <div key={type}>
          <label>{type}</label>
          <input
            value={monster.speed[type]}
            onChange={(e) => handleNestedChange("speed", type, e.target.value)}
          />
        </div>
      ))}

      {/* Ability Scores */}
      <h3>Ability Scores</h3>
      {Object.keys(monster.abilityScores).map((attr) => (
        <div key={attr}>
          <label>{attr.toUpperCase()}</label>
          <input
            value={monster.abilityScores[attr]}
            onChange={(e) =>
              handleNestedChange("abilityScores", attr, e.target.value)
            }
          />
        </div>
      ))}

      {/* Saving Throws */}
      <h3>Saving Throws</h3>
      {Object.entries(monster.savingThrows || {}).map(([key, val]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            value={val}
            onChange={(e) =>
              handleKeyValueChange("savingThrows", key, e.target.value)
            }
          />
          <button
            onClick={() => removeKeyFromSection("savingThrows", key)}
            className="remove-btn"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="key-pair-row">
        <input
          type="text"
          placeholder="Save name (e.g. CON)"
          value={newSave.key}
          onChange={(e) =>
            setNewSave((prev) => ({ ...prev, key: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Value (e.g. +5)"
          value={newSave.value}
          onChange={(e) =>
            setNewSave((prev) => ({ ...prev, value: e.target.value }))
          }
        />
        <button
          onClick={() => {
            if (newSave.key && newSave.value) {
              handleKeyValueChange("savingThrows", newSave.key, newSave.value);
              setNewSave({ key: "", value: "" });
            }
          }}
        >
          Add
        </button>
      </div>

      {/* Skills */}
      <h3>Skills</h3>
      {Object.entries(monster.skills || {}).map(([key, val]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            value={val}
            onChange={(e) =>
              handleKeyValueChange("skills", key, e.target.value)
            }
          />
          <button
            onClick={() => removeKeyFromSection("skills", key)}
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
              handleKeyValueChange("skills", newSkill.key, newSkill.value);
              setNewSkill({ key: "", value: "" });
            }
          }}
        >
          Add
        </button>
      </div>

      {/* Senses */}
      <h3>Senses</h3>
      {[
        "darkvision",
        "blindsight",
        "tremorsense",
        "truesight",
        "passivePerception",
      ].map((sense) => (
        <div key={sense}>
          <label>{sense}</label>
          <input
            value={monster.senses[sense]}
            onChange={(e) =>
              handleNestedChange("senses", sense, e.target.value)
            }
          />
        </div>
      ))}
      <label>Languages</label>
      <input
        value={monster.languages}
        onChange={(e) => handleChange("languages", e.target.value)}
      />

      {/* CR & Proficiency */}
      <label>Challenge Rating</label>
      <input
        value={monster.challengeRating}
        onChange={(e) => handleChange("challengeRating", e.target.value)}
      />

      <label>Proficiency Bonus</label>
      <input
        value={monster.proficiencyBonus}
        onChange={(e) => handleChange("proficiencyBonus", e.target.value)}
      />

      {/* Traits / Actions / etc. */}
      {[
        "traits",
        "actions",
        "reactions",
        "legendaryResistances",
        "legendaryActions",
        "lairActions",
        "regionalEffects",
      ].map((section) => (
        <div key={section}>
          <h3>
            {section
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase())}
          </h3>
          {monster[section]?.map((item, index) => (
            <div key={index} className="custom-section-block">
              <label>Title</label>
              <input
                value={item.name}
                onChange={(e) =>
                  updateListItem(section, index, "name", e.target.value)
                }
              />
              <label>Description</label>
              <textarea
                value={item.desc}
                onChange={(e) =>
                  updateListItem(section, index, "desc", e.target.value)
                }
              />
              <button
                onClick={() => removeListItem(section, index)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="add-section-btn"
            onClick={() => addListItem(section)}
          >
            + Add {section}
          </button>
        </div>
      ))}

      {/* Description & Image */}
      <label>Description (Lore)</label>
      <textarea
        value={monster.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <h3>Monster Image</h3>
      <div className="image-input-toggle">
        <label>
          <input
            type="radio"
            name="imageSource"
            value="url"
            checked={!useUpload}
            onChange={() => setUseUpload(false)}
          />
          Use URL
        </label>

        <label>
          <input
            type="radio"
            name="imageSource"
            value="upload"
            checked={useUpload}
            onChange={() => setUseUpload(true)}
          />
          Upload Image
        </label>
      </div>

      {!useUpload ? (
        <>
          <label>Image URL</label>
          <input
            type="text"
            placeholder="https://example.com/your-image.jpg"
            value={monster.image}
            onChange={(e) => handleChange("image", e.target.value)}
          />
        </>
      ) : (
        <>
          <label>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const formData = new FormData();
                formData.append("image", file);

                try {
                  const res = await axios.post(
                    "/api/uploads/monsters",
                    formData,
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  handleChange("image", res.data.url);
                } catch (err) {
                  console.error("Image upload failed:", err);
                  alert("Failed to upload image. See console for details.");
                }
              }
            }}
          />
        </>
      )}

      <button className="submit-btn" onClick={() => onSubmit(monster)}>
        {monster._id ? "Update Monster" : "Save Monster"}
      </button>
    </div>
  );
};

export default MonsterForm;
