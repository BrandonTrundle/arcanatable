import React from "react";
import CharacterImageUpload from "./CharacterImageUpload";
import "../../styles/CharacterSheetStyles/AppearanceAndAllies.css";

const AppearanceAndAllies = ({ formData, handleChange, setFormData }) => {
  // helper to resolve absolute vs. relative URLs
  const getImgSrc = (url) => {
    if (!url) return null;
    return url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_API_URL}${url}`;
  };

  return (
    <div className="appearance-allies-container">
      {/* Left: Character Image (portrait preview/new or existing) */}
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
          {/*
            Show in this order:
              1) live preview if they just picked a file
              2) previously saved URL from formData.orgSymbolImage
              3) fallback text
          */}
          {formData.orgSymbolImagePreview ? (
            <img
              src={formData.orgSymbolImagePreview}
              alt="Org Symbol Preview"
              className="org-symbol-img"
            />
          ) : formData.orgSymbolImage ? (
            <img
              src={getImgSrc(formData.orgSymbolImage)}
              alt="Org Symbol"
              className="org-symbol-img"
            />
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

            const previewUrl = URL.createObjectURL(file);
            setFormData((prev) => ({
              ...prev,
              orgSymbolImageFile: file,
              orgSymbolImagePreview: previewUrl,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default AppearanceAndAllies;
