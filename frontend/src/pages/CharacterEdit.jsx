import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Auth/Navbar";
import BasicsTab from "../components/CharacterForm/BasicsTab";
import "../styles/CharacterSheetStyles/CharacterDashboard.css";
import "../styles/CharacterSheetStyles/CharacterSheet.css";
import backgroundImage from "../assets/CharacterDashboard.png";
import PageTwo from "../components/CharacterForm/PageTwo";
import PageThree from "../components/CharacterForm/PageThree";
import axios from "axios";

const CharacterEdit = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basics");
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/characters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Error fetching character:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/characters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Error fetching character:", err);
      } finally {
        setLoading(false);
      }
    };

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

    fetchCharacter();
    if (user?._id) fetchCampaigns();
  }, [id, user]);

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

    try {
      let updatedPortraitImage = formData.portraitImage;
      let updatedOrgSymbolImage = formData.orgSymbolImage;

      if (formData.portraitImageFile) {
        updatedPortraitImage = await uploadImageToSupabase(
          formData.portraitImageFile
        );
      }
      if (formData.orgSymbolImageFile) {
        updatedOrgSymbolImage = await uploadImageToSupabase(
          formData.orgSymbolImageFile
        );
      }

      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (
          ![
            "portraitImageFile",
            "portraitImagePreview",
            "orgSymbolImageFile",
            "orgSymbolImagePreview",
            "portraitImage",
            "orgSymbolImage",
          ].includes(key)
        ) {
          formDataToSend.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : value ?? ""
          );
        }
      });

      // Explicitly cast to string to avoid accidental arrays
      formDataToSend.append("portraitImage", String(updatedPortraitImage));
      formDataToSend.append("orgSymbolImage", String(updatedOrgSymbolImage));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      if (res.ok) {
        navigate("/characters");
      } else {
        const err = await res.json();
        console.error("Update failed:", err.message);
      }
    } catch (err) {
      console.error("Error updating character:", err);
    }
  };

  const renderTabButton = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`tab-button ${activeTab === id ? "active" : ""}`}
    >
      {label}
    </button>
  );

  // Utility function to upload image to Supabase
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

  if (loading || !formData) return <p>Loading character...</p>;

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
          <h1>Edit Character</h1>

          {/* Tab Navigation */}
          <div className="tab-header">
            {renderTabButton("basics", "Page 1")}
            {renderTabButton("attributes", "Page 2")}
            {renderTabButton("spells", "Page 3")}
            {/* More tab buttons can go here */}
          </div>

          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="create-character-btn">
              Save Changes
            </button>
            <div className="form-group">
              <label htmlFor="campaign">Assign to Campaign (optional)</label>
              <select
                name="campaign"
                value={formData.campaign || ""}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- No Campaign --</option>
                {campaigns.map((camp) => (
                  <option key={camp._id} value={camp._id}>
                    {camp.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CharacterEdit;
