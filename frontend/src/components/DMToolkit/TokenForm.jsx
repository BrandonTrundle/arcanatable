import React, { useState } from "react";
import axios from "axios";
import "../../styles/TokenForm.css";

const TokenForm = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tokenSize, setTokenSize] = useState("Medium");
  const [defaultLayer, setDefaultLayer] = useState("dm");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image) {
      alert("Please provide a name and an image.");
      return;
    }

    try {
      setUploading(true);

      // Upload image
      const formData = new FormData();
      formData.append("image", image);

      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/uploads/tokenImages`,
        formData
      );

      const imageUrl = uploadRes.data.url;

      // Create token item
      const content = {
        imageUrl,
        tokenSize,
        defaultLayer,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dmtoolkit`,
        {
          toolkitType: "Token",
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (onCreated) onCreated(res.data);

      // Reset form
      setTitle("");
      setImage(null);
      setImagePreview(null);
      setTokenSize("Medium");
      setDefaultLayer("dm");
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      console.error("Token creation failed:", message);
      alert(`Error creating token: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="token-form" onSubmit={handleSubmit}>
      <h3>Create New Token</h3>

      <input
        type="text"
        placeholder="Token Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        required
      />

      {imagePreview && <img src={imagePreview} alt="Token preview" />}

      <select value={tokenSize} onChange={(e) => setTokenSize(e.target.value)}>
        {["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={defaultLayer}
        onChange={(e) => setDefaultLayer(e.target.value)}
      >
        {["dm", "player", "event"].map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()} Layer
          </option>
        ))}
      </select>

      <button type="submit" disabled={uploading}>
        {uploading ? "Saving..." : "Create Token"}
      </button>
    </form>
  );
};

export default TokenForm;
