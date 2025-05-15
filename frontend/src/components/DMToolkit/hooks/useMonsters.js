import { useEffect, useState } from "react";
import {
  fetchMonsters,
  createMonster,
  updateMonster,
  deleteMonster,
} from "../../../services/monsterService";

export const useMonsters = () => {
  const [monsters, setMonsters] = useState([]);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
  }, []);

  const resetForm = () => {
    setIsFormOpen(false);
    setSelectedMonster(null);
    setIsEditing(false);
  };

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

    try {
      await updateMonster(monsterId, updated);
      setMonsters((prev) =>
        prev.map((mon) => (mon._id === monsterId ? updated : mon))
      );
    } catch (err) {
      console.error("Failed to update monster:", err);
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

  return {
    monsters,
    selectedMonster,
    isEditing,
    isFormOpen,
    setSelectedMonster,
    setIsEditing,
    setIsFormOpen,
    resetForm,
    handleCreate,
    handleUpdate,
    handleDelete,
    assignCampaign,
    removeCampaign,
  };
};
