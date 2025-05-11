import React from "react";
import "../../styles/CharacterSheetStyles/CharacterImageUpload.css";

const CharacterImageUpload = ({ formData, setFormData }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      portraitImageFile: file, // store the File object
      portraitImagePreview: previewUrl, // store preview URL
    }));
  };

  return (
    <div className="character-image-upload">
      <div className="image-preview">
        {formData.portraitImagePreview || formData.portraitImage ? (
          <img
            src={
              formData.portraitImagePreview ||
              `http://localhost:5000${formData.portraitImage}`
            }
            alt="Portrait Preview"
          />
        ) : (
          <span>No image uploaded</span>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
};

export default CharacterImageUpload;
