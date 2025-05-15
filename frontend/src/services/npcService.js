import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/dmtoolkit`;

export const fetchNPCs = async () => {
  const response = await axios.get(BASE_URL);
  return response.data.filter((item) => item.toolkitType === "NPC");
};

export const createNPC = async (npc) => {
  const response = await axios.post("/api/dmtoolkit", {
    toolkitType: "NPC",
    title: npc.name || "Untitled",
    content: npc,
  });
  return response.data;
};

export const updateNPC = async (id, npc) => {
  const response = await axios.patch(`/api/dmtoolkit/${id}`, {
    title: npc.name || "Untitled",
    content: npc,
  });
  return response.data;
};

export const deleteNPC = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};
