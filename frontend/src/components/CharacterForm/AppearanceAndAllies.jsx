import React from "react";
import CharacterImageUpload from "./CharacterImageUpload";
import "../../styles/CharacterSheetStyles/AppearanceAndAllies.css";

const AppearanceAndAllies = ({ formData, handleChange, setFormData }) => {
  return (
    <div className="appearance-allies-container">
      {/* Left: Character Image */}
      <CharacterImageUpload formData={formData} setFormData={setFormData} />

      {/* Center: Allies textarea */}
      <div className="allies-text">
        <label>Allies & Organizations</label>
        <textarea
          name="allies"
          value={formData.allies || ""}
          onChange={handleChange}
          rows={10}
        />
      </div>

      {/* Right: Organization Info */}
      <div className="organization-block">
        <label>Name</label>
        <input
          type="text"
          name="orgName"
          value={formData.orgName || ""}
          onChange={handleChange}
        />
        <label>Symbol</label>
        <div className="org-symbol-preview">
          {formData.orgSymbolImage ? (
            <img src={formData.orgSymbolImage} alt="Org Symbol" />
          ) : (
            <span>No symbol uploaded</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
              setFormData((prev) => ({
                ...prev,
                orgSymbolImage: reader.result,
              }));
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>
    </div>
  );
};

export default AppearanceAndAllies;
