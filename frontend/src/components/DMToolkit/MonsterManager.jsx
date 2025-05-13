import React, { useEffect, useState } from "react";
import MonsterForm from "./MonsterForm";
import MonsterPreview from "./MonsterPreview";
import "../../styles/MonsterManager.css";
import { useUserContext } from "../../context/UserContext";
import axios from "axios";
import {
  fetchMonsters,
  createMonster,
  updateMonster,
  deleteMonster,
} from "../../services/monsterService";

const dummyCampaigns = [
  "The Crimson Pact",
  "Storm of Embers",
  "Hollowreach",
  "Sunken Vale",
];

const defaultMonster = {
  name: "",
  tokenSize: "",
  type: "",
  alignment: "",
  armorClass: "",
  hitPoints: "",
  hitDice: "",
  speed: { walk: "", fly: "", swim: "", climb: "", burrow: "" },
  abilityScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" },
  savingThrows: {},
  skills: {},
  damageVulnerabilities: [],
  damageResistances: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: {
    darkvision: "",
    blindsight: "",
    tremorsense: "",
    truesight: "",
    passivePerception: "",
  },
  languages: "",
  challengeRating: "",
  proficiencyBonus: "",
  traits: [],
  actions: [],
  reactions: [],
  legendaryResistances: [],
  legendaryActions: [],
  lairActions: [],
  regionalEffects: [],
  description: "",
  image: "",
  extraSections: [],
  campaigns: [], // <-- new field
};

const MonsterManager = () => {
  const [monsters, setMonsters] = useState([]);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const { user } = useUserContext();

  useEffect(() => {
    fetchMonsters()
      .then((data) => {
        const unpacked = data.map((item) => ({
          _id: item._id,
          ...item.content,
          campaigns: item.content.campaigns || [],
        }));
        setMonsters(unpacked);
      })
      .catch(console.error);

    const fetchCampaigns = async () => {
      try {
        const res = await axios.get("/api/campaigns", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const ownedCampaigns = res.data.filter((c) => c.creator === user._id);
        setCampaigns(ownedCampaigns);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCreate = async (monster) => {
    const created = await createMonster(monster);
    setMonsters((prev) => [...prev, { _id: created._id, ...created.content }]);
    resetForm();
  };

  const handleUpdate = async (updatedMonster) => {
    const updated = await updateMonster(updatedMonster._id, updatedMonster);
    setMonsters((prev) =>
      prev.map((mon) =>
        mon._id === updated._id ? { _id: updated._id, ...updated.content } : mon
      )
    );
    resetForm();
  };

  const handleDelete = async (id) => {
    await deleteMonster(id);
    setMonsters((prev) => prev.filter((mon) => mon._id !== id));
    if (selectedMonster && selectedMonster._id === id) {
      resetForm();
    }
  };

  const handleEditClick = (monster) => {
    setSelectedMonster(monster);
    setIsFormOpen(true);
    setIsEditing(true);
  };

  const handleNewClick = () => {
    setSelectedMonster({ ...defaultMonster });
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setSelectedMonster(null);
    setIsEditing(false);
  };

  const assignCampaign = async (monsterId, campaignId) => {
    const original = monsters.find((mon) => mon._id === monsterId);
    if (!original) return;

    const alreadyAssigned = original.campaigns?.includes(campaignId);
    const updated = {
      ...original,
      campaigns: alreadyAssigned
        ? original.campaigns
        : [...(original.campaigns || []), campaignId],
    };

    // ✅ Save to backend using correct structure
    try {
      await updateMonster(monsterId, updated); // monsterId is required
      setMonsters((prev) =>
        prev.map((mon) => (mon._id === monsterId ? updated : mon))
      );
    } catch (err) {
      console.error("❌ Failed to update monster:", err);
      alert("Failed to assign campaign. Please try again.");
    }
  };

  const removeCampaign = (monsterId, campaignId) => {
    setMonsters((prev) =>
      prev.map((mon) => {
        if (mon._id !== monsterId) return mon;
        return {
          ...mon,

          campaigns: mon.campaigns.filter((c) => c !== campaignId),
        };
      })
    );
  };

  return (
    <div className="monster-manager-container">
      <div className="monster-manager-header">
        <h3>Saved Monsters</h3>
        <button onClick={handleNewClick}>+ New Monster</button>
      </div>
      {monsters.length === 0 ? (
        <p>No monsters yet.</p>
      ) : (
        <ul className="monster-list">
          {monsters.map((mon) => (
            <li key={mon._id} className="monster-list-item">
              <div className="monster-info">
                <span
                  className="monster-name"
                  onClick={() =>
                    selectedMonster && selectedMonster._id === mon._id
                      ? setSelectedMonster(null)
                      : setSelectedMonster(mon)
                  }
                >
                  {mon.name}
                </span>

                <select
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected) {
                      assignCampaign(mon._id, selected);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Assign to Campaign
                  </option>
                  {campaigns.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {mon.campaigns?.length > 0 && (
                  <ul className="assigned-campaigns">
                    {mon.campaigns.map((campId, idx) => {
                      const campaign = campaigns.find((c) => c._id === campId);
                      return (
                        <li key={idx}>
                          {campaign?.name || "Unknown"}
                          <button
                            className="remove-campaign-btn"
                            onClick={() => removeCampaign(mon._id, campId)}
                            title={`Remove ${campaign?.name || "Unknown"}`}
                          >
                            ✖
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="monster-actions">
                <button
                  onClick={() => handleEditClick(mon)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(mon._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isFormOpen && selectedMonster && (
        <MonsterForm
          monster={selectedMonster}
          setMonster={setSelectedMonster}
          closeForm={resetForm}
          onSubmit={isEditing ? handleUpdate : handleCreate}
        />
      )}

      {selectedMonster && <MonsterPreview data={selectedMonster} />}
    </div>
  );
};

export default MonsterManager;
