import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import "../styles/CreateCampaign.css";

const CreateCampaign = () => {
  const [name, setName] = useState("");
  const [gameSystem, setGameSystem] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = "";

    try {
      // Upload image only if one was selected
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadRes = await fetch("/api/uploads/campaigns", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          gameSystem,
          imageUrl: finalImageUrl,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create campaign");
      }

      navigate("/campaigns");
    } catch (err) {
      console.error("Campaign creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-campaign-container">
        <h1>Create a New Campaign</h1>
        <form onSubmit={handleSubmit} className="create-campaign-form">
          <label>
            Campaign Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Game System:
            <input
              type="text"
              value={gameSystem}
              onChange={(e) => setGameSystem(e.target.value)}
              required
            />
          </label>

          <label>
            Campaign Image:
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          {imagePreviewUrl && (
            <div className="preview-image">
              <img src={imagePreviewUrl} alt="Preview" />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateCampaign;
