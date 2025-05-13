import axios from "axios";

const API_BASE = "/api/dmtoolkit";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchMonsters = async () => {
  const res = await axios.get(API_BASE);
  return res.data.filter((item) => item.toolkitType === "Monster");
};

export const createMonster = async (monster) => {
  const payload = {
    toolkitType: "Monster",
    title: monster.name || "Untitled Monster",
    content: monster,
  };
  const res = await axios.post("/api/dmtoolkit", payload);
  return res.data;
};

export const updateMonster = async (id, updatedMonster) => {
  const response = await axios.patch(`/api/dmtoolkit/${id}`, {
    content: updatedMonster,
  });
  return response.data;
};

export const deleteMonster = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};
