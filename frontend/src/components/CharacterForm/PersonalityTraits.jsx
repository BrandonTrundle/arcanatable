import React from "react";

const PersonalityTraits = ({ formData, handleChange }) => {
  return (
    <div className="personality-section">
      {["personalityTraits", "ideals", "bonds", "flaws"].map((field) => (
        <div className="personality-box" key={field}>
          <h5>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</h5>
          <textarea
            name={field}
            value={formData[field] || ""}
            onChange={handleChange}
            rows={4}
          />
        </div>
      ))}

      {/* Features & Traits */}
      <div className="personality-box">
        <h5>FEATURES & TRAITS</h5>
        <textarea
          name="features"
          value={formData.features || ""}
          onChange={handleChange}
          rows={10}
        />
      </div>
    </div>
  );
};

export default PersonalityTraits;
