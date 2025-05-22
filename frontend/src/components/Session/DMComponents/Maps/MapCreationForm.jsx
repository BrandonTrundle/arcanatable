import React, { useState } from "react";

const MapCreationForm = ({ onSubmit, onImageUpload, campaignId }) => {
  const [form, setForm] = useState({
    name: "",
    width: "",
    height: "",
    image: null,
    previewUrl: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      image: file,
      previewUrl,
    }));
  };

  const handleSubmit = async () => {
    const { name, width, height, image } = form;
    if (!name || !width || !height || !image) return;

    try {
      // Pass the raw File to onImageUpload; it will assemble FormData and call the correct endpoint
      const imageUrl = await onImageUpload(image);

      onSubmit({ name, width, height, imageUrl, campaign: campaignId });

      setForm({
        name: "",
        width: "",
        height: "",
        image: null,
        previewUrl: "",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

  return (
    <div className="map-form">
      <input
        type="text"
        placeholder="Map Name"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <input
        type="number"
        placeholder="Width (squares)"
        value={form.width}
        onChange={(e) => handleChange("width", e.target.value)}
      />
      <input
        type="number"
        placeholder="Height (squares)"
        value={form.height}
        onChange={(e) => handleChange("height", e.target.value)}
      />
      <label htmlFor="map-image">Map Image</label>
      <input
        id="map-image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {form.previewUrl && (
        <img src={form.previewUrl} alt="Map Preview" className="map-preview" />
      )}

      <button onClick={handleSubmit}>➕ Add Map</button>
    </div>
  );
};

export default MapCreationForm;
