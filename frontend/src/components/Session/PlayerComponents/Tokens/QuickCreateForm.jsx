import React, { useState } from "react";

const QuickCreateForm = ({ onSave }) => {
  const [name, setName] = useState("");
  const [size, setSize] = useState("Medium");
  const [image, setImage] = useState("");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !image) {
      alert("⚠️ Name and image are required.");
      return;
    }

    const result = await onSave({ name, imageUrl: image, size });

    if (result.success) {
      setName("");
      setSize("Medium");
      setImage("");
    } else {
      alert("❌ Failed to save token.");
    }
  };

  return (
    <div className="quick-create-form">
      <label>
        Token Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter token name"
        />
      </label>

      <label>
        Token Size:
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="Tiny">Tiny</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
          <option value="Huge">Huge</option>
          <option value="Gargantuan">Gargantuan</option>
        </select>
      </label>

      <label>
        Upload Image:
        <input type="file" accept="image/*" onChange={handleUpload} />
      </label>

      {image && (
        <div className="token-preview">
          <p style={{ marginTop: "0.5rem" }}>Drag to map:</p>
          <img
            src={image}
            alt="Quick Token"
            className="token-thumbnail"
            draggable
            onDragStart={(e) => {
              const payload = {
                id: `quick-${Date.now()}`,
                name: name || "Quick Token",
                imageUrl: image,
                tokenSize: size,
                layer: "player",
              };
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify(payload)
              );
              e.dataTransfer.effectAllowed = "copy";
            }}
          />
        </div>
      )}

      <button onClick={handleSubmit}>💾 Save to Toolkit</button>
    </div>
  );
};

export default QuickCreateForm;
