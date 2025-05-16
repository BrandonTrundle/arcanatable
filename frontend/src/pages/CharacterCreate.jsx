import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import backgroundImage from "../assets/CharacterDashboard.png";
import emptyCharacter from "../data/emptyCharacter";
import BasicsTab from "../components/CharacterForm/BasicsTab";
import "../styles/CharacterSheetStyles/CharacterCreate.css";
import "../styles/CharacterSheetStyles/AbilityBlock.css";
import "../styles/CharacterSheetStyles/BonusSection.css";
import "../styles/CharacterSheetStyles/CharacterInfo.css";
import "../styles/CharacterSheetStyles/CharacterSheet.css";
import "../styles/CharacterSheetStyles/CombatStats.css";
import "../styles/CharacterSheetStyles/PersonalityTraits.css";
import "../styles/CharacterSheetStyles/CharacterInfo.css";
import PageTwo from "../components/CharacterForm/PageTwo";
import PageThree from "../components/CharacterForm/PageThree";
import axios from "axios";

const CharacterCreate = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basics");
  const [campaigns, setCampaigns] = useState([]);

  const renderTabButton = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`tab-button ${activeTab === id ? "active" : ""}`}
    >
      {label}
    </button>
  );

  const [formData, setFormData] = useState(emptyCharacter);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: val,
          },
        };
      }
      return { ...prev, [name]: val };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. Upload images first
    if (formData.portraitImageFile) {
      formData.portraitImage = await uploadImageToSupabase(
        formData.portraitImageFile
      );
    }
    if (formData.orgSymbolImageFile) {
      formData.orgSymbolImage = await uploadImageToSupabase(
        formData.orgSymbolImageFile
      );
    }

    // ✅ 2. THEN build the FormData
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "portraitImageFile" &&
        key !== "portraitImagePreview" &&
        key !== "orgSymbolImageFile" &&
        key !== "orgSymbolImagePreview"
      ) {
        const isObjectOrArray = typeof value === "object" && value !== null;
        formDataToSend.append(
          key,
          isObjectOrArray ? JSON.stringify(value) : value ?? ""
        );
      }
    });

    // ✅ 3. These are now safe to include because upload already happened
    if (formData.portraitImage) {
      formDataToSend.append("portraitImage", formData.portraitImage);
    }
    if (formData.orgSymbolImage) {
      formDataToSend.append("orgSymbolImage", formData.orgSymbolImage);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        navigate("/characters");
      } else {
        const err = await response.json();
        console.error("Failed to create character:", err.message);
      }
    } catch (err) {
      console.error("Error submitting character:", err);
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const allCampaigns = res.data;
        const playerCampaigns = allCampaigns.filter(
          (camp) => camp.creator !== user._id
        );
        setCampaigns(playerCampaigns);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      }
    };

    if (user?._id) {
      fetchCampaigns();
    }
  }, [user]);

  // Utility function to upload image
  const uploadImageToSupabase = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/uploads/characters`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Image upload failed");

    return data.url; // Supabase public URL
  };

  return (
    <>
      <Navbar />
      <div
        className="character-dashboard"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "0% 25%",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "10rem",
        }}
      >
        <div className="character-dashboard-content-main">
          <h1>Create a New Character</h1>

          {/* Tab Navigation */}
          <div className="tab-header">
            {renderTabButton("basics", "Page 1")}
            {renderTabButton("attributes", "Page 2")}
            {renderTabButton("spells", "Page 3")}
            {/* More tab buttons coming later */}
          </div>

          <form onSubmit={handleSubmit}>
            {/* TAB: BASICS */}
            {activeTab === "basics" && (
              <BasicsTab
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            )}
            {activeTab === "attributes" && (
              <PageTwo
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            )}
            {activeTab === "spells" && (
              <PageThree
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            )}
            <div className="form-group">
              <label htmlFor="campaign">Assign to Campaign (optional)</label>
              <select
                name="campaign"
                value={formData.campaign || ""}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- Select a Campaign --</option>
                {campaigns.map((camp) => (
                  <option key={camp._id} value={camp._id}>
                    {camp.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="create-character-btn">
              Save Character
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CharacterCreate;
