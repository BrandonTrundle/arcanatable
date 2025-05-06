import React from "react";
import "../../styles/CharacterSheetStyles/CharacterImageUpload.css";

const CharacterImageUpload = ({ formData, setFormData }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        portraitImage: reader.result, // base64 string
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="character-image-upload">
      <div className="image-preview">
        {formData.portraitImage ? (
          <img src={formData.portraitImage} alt="Portrait Preview" />
        ) : (
          <span>No image uploaded</span>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
};

export default CharacterImageUpload;
