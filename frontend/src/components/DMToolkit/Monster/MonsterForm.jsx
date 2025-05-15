import React, { useState } from "react";
import "../../../styles/MonsterForm.css";
import axios from "axios";

import MonsterBasicInfo from "../Forms/MonsterBasicInfo";
import SpeedSection from "../Forms/SpeedSection";
import AbilityScoresSection from "../Forms/AbilityScoresSection";
import SavingThrowsSection from "../Forms/SavingThrowsSection";
import SkillsSection from "../Forms/SkillsSection";
import SensesSection from "../Forms/SensesSection";
import CrAndProficiencySection from "../Forms/CrAndProficiencySection";
import SectionListEditor from "../Forms/SectionListEditor";
import DescriptionEditor from "../Forms/DescriptionEditor";
import ImageUploadSelector from "../Forms/ImageUploadSelector";

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

  const handleSubmit = async () => {
    const dataToSubmit = { ...monster };

    if (useUpload && monster.image instanceof File) {
      const formData = new FormData();
      formData.append("image", monster.image);

      try {
        const res = await axios.post("/api/uploads/monsters", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        dataToSubmit.image = res.data.url;
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image.");
        return;
      }
    }

    onSubmit(dataToSubmit);
  };

  return (
    <div className="monster-form-panel">
      <button className="close-btn" onClick={closeForm}>
        ✖
      </button>
      <h2>Monster Details</h2>

      <MonsterBasicInfo monster={monster} handleChange={handleChange} />
      <SpeedSection speed={monster.speed} onChange={handleNestedChange} />
      <AbilityScoresSection
        scores={monster.abilityScores}
        onChange={handleNestedChange}
      />
      <SavingThrowsSection
        savingThrows={monster.savingThrows}
        onChange={handleKeyValueChange}
        onRemove={removeKeyFromSection}
        newSave={newSave}
        setNewSave={setNewSave}
        onAdd={handleKeyValueChange}
      />
      <SkillsSection
        skills={monster.skills}
        onChange={handleKeyValueChange}
        onRemove={removeKeyFromSection}
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        onAdd={handleKeyValueChange}
      />
      <SensesSection senses={monster.senses} onChange={handleNestedChange} />
      <label>Languages</label>
      <input
        value={monster.languages}
        onChange={(e) => handleChange("languages", e.target.value)}
      />
      <CrAndProficiencySection monster={monster} onChange={handleChange} />
      {[
        "traits",
        "actions",
        "reactions",
        "legendaryResistances",
        "legendaryActions",
        "lairActions",
        "regionalEffects",
      ].map((section) => (
        <SectionListEditor
          key={section}
          label={section}
          items={monster[section]}
          onChange={updateListItem}
          onRemove={removeListItem}
          onAdd={addListItem}
        />
      ))}
      <DescriptionEditor value={monster.description} onChange={handleChange} />
      <ImageUploadSelector
        useUpload={useUpload}
        setUseUpload={setUseUpload}
        image={monster.image}
        onChange={handleChange}
      />
      <button className="submit-btn" onClick={handleSubmit}>
        {monster._id ? "Update Monster" : "Save Monster"}
      </button>
    </div>
  );
};

export default MonsterForm;
