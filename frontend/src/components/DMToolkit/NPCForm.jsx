import React, { useState } from "react";
import "../../styles/NPCForm.css";
import axios from "axios";

const NPCForm = ({ npc, setNPC, closeForm, onSubmit }) => {
  const [newSkill, setNewSkill] = useState({ key: "", value: "" });
  const [newSave, setNewSave] = useState({ key: "", value: "" });
  const [newLang, setNewLang] = useState("");

  const handleChange = (field, value) => {
    setNPC((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setNPC((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleKeyValueChange = (section, key, value) => {
    setNPC((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const removeKeyFromSection = (section, key) => {
    const updated = { ...npc[section] };
    delete updated[key];
    setNPC((prev) => ({ ...prev, [section]: updated }));
  };

  const handleListChange = (field, index, value) => {
    const updated = [...npc[field]];
    updated[index] = value;
    setNPC((prev) => ({ ...prev, [field]: updated }));
  };

  const addToList = (field, item = "") => {
    setNPC((prev) => ({ ...prev, [field]: [...(prev[field] || []), item] }));
  };

  const removeFromList = (field, index) => {
    const updated = [...npc[field]];
    updated.splice(index, 1);
    setNPC((prev) => ({ ...prev, [field]: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(npc);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("/api/uploads/npcs", formData); // or use `/api/uploads/npcs` if you split folders
      setNPC((prev) => ({ ...prev, image: res.data.url }));
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  return (
    <div className="npc-form-panel">
      <button className="close-btn" onClick={closeForm}>
        ✖
      </button>
      <h2>NPC Details</h2>

      {/* General Info */}
      {[
        "name",
        "race",
        "class",
        "gender",
        "age",
        "alignment",
        "background",
        "occupation",
        "armorClass",
        "hitPoints",
        "hitDice",
        "speed",
        "proficiencyBonus",
        "challengeRating",
        "description",
      ].map((field) => (
        <div key={field}>
          <label>{field}</label>
          <input
            type="text"
            value={npc[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        </div>
      ))}

      {/* Image Upload */}
      <h3>Image</h3>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {npc.image && (
        <div style={{ marginTop: "1rem" }}>
          <img
            src={npc.image}
            alt="NPC portrait"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>
      )}

      {/* Token Size Dropdown */}
      <div>
        <label>Token Size</label>
        <select
          value={npc.tokenSize}
          onChange={(e) => handleChange("tokenSize", e.target.value)}
        >
          {["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"].map(
            (size) => (
              <option key={size} value={size}>
                {size}
              </option>
            )
          )}
        </select>
      </div>

      {/* Ability Scores */}
      <h3>Ability Scores</h3>
      {Object.keys(npc.abilityScores || {}).map((attr) => (
        <div key={attr}>
          <label>{attr.toUpperCase()}</label>
          <input
            type="number"
            value={npc.abilityScores[attr]}
            onChange={(e) =>
              handleNestedChange(
                "abilityScores",
                attr,
                parseInt(e.target.value)
              )
            }
          />
        </div>
      ))}

      {/* Saving Throws */}
      <h3>Saving Throws</h3>
      {Object.entries(npc.savingThrows || {}).map(([key, val]) => (
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
      <div>
        <input
          placeholder="Save name (e.g. CHA)"
          value={newSave.key}
          onChange={(e) =>
            setNewSave((prev) => ({ ...prev, key: e.target.value }))
          }
        />
        <input
          placeholder="Value (e.g. +3)"
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
      {Object.entries(npc.skills || {}).map(([key, val]) => (
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
      <div>
        <input
          placeholder="Skill (e.g. Stealth)"
          value={newSkill.key}
          onChange={(e) =>
            setNewSkill((prev) => ({ ...prev, key: e.target.value }))
          }
        />
        <input
          placeholder="Value (e.g. +5)"
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

      {/* Traits, Actions */}
      {["traits", "actions"].map((field) => (
        <div key={field}>
          <h3>{field.charAt(0).toUpperCase() + field.slice(1)}</h3>
          {(npc[field] || []).map((item, i) => (
            <div key={i} className="custom-section-block">
              <label>Name</label>
              <input
                value={item.name}
                onChange={(e) => {
                  const updated = [...npc[field]];
                  updated[i].name = e.target.value;
                  setNPC((prev) => ({ ...prev, [field]: updated }));
                }}
              />
              <label>Description</label>
              <textarea
                value={item.desc}
                onChange={(e) => {
                  const updated = [...npc[field]];
                  updated[i].desc = e.target.value;
                  setNPC((prev) => ({ ...prev, [field]: updated }));
                }}
              />
              <button
                onClick={() => removeFromList(field, i)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addToList(field, { name: "", desc: "" })}
            className="add-section-btn"
          >
            + Add {field.slice(0, -1)}
          </button>
        </div>
      ))}

      {/* Languages */}
      <h3>Languages</h3>
      <ul>
        {(npc.languages || []).map((lang, i) => (
          <li key={i}>
            <input
              value={lang}
              onChange={(e) => handleListChange("languages", i, e.target.value)}
            />
            <button
              onClick={() => removeFromList("languages", i)}
              className="remove-btn"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <input
        placeholder="New language"
        value={newLang}
        onChange={(e) => setNewLang(e.target.value)}
      />
      <button
        onClick={() => {
          if (newLang) {
            addToList("languages", newLang);
            setNewLang("");
          }
        }}
      >
        Add
      </button>

      {/* Submit */}
      <button onClick={handleSubmit} className="add-section-btn">
        Save NPC
      </button>
    </div>
  );
};

export default NPCForm;
