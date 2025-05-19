import React, { useEffect, useState } from "react";
import { getApiUrl } from "../../utils/env";
import styles from "../../styles/AdminModules/PatchManager.module.css";

const PatchManager = () => {
  const [patches, setPatches] = useState([]);
  const [form, setForm] = useState({
    version: "",
    title: "",
    content: "",
    tag: "update",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPatches = async () => {
    const res = await fetch(`${getApiUrl()}/api/patches`);
    const data = await res.json();
    setPatches(data);
  };

  useEffect(() => {
    fetchPatches();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${getApiUrl()}/api/patches/${editingId}`
      : `${getApiUrl()}/api/patches`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ version: "", title: "", content: "" });
      setEditingId(null);
      fetchPatches();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patch note?")) return;
    await fetch(`${getApiUrl()}/api/patches/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPatches();
  };

  const startEdit = (patch) => {
    setForm({
      version: patch.version,
      title: patch.title,
      content: patch.content,
      tag: patch.tag || "update",
    });
    setEditingId(patch._id);
  };

  return (
    <div className={styles.container}>
      <h2>{editingId ? "Edit Patch" : "New Patch"}</h2>
      <form onSubmit={handleSubmit} className={styles.patchForm}>
        <input
          type="text"
          name="version"
          placeholder="Version (e.g. v0.1.5)"
          value={form.version}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <select
          name="tag"
          value={form.tag || "update"}
          onChange={handleChange}
          required
        >
          <option value="feature">✨ Feature</option>
          <option value="fix">🐛 Fix</option>
          <option value="tweak">🔧 Tweak</option>
          <option value="beta">🧪 Beta</option>
          <option value="update">📦 General</option>
        </select>
        <textarea
          name="content"
          placeholder="Patch details..."
          value={form.content}
          onChange={handleChange}
          rows={6}
          required
        />
        <button type="submit">{editingId ? "Update" : "Create"} Patch</button>
      </form>

      <h3>All Patches</h3>
      <ul className={styles.patchList}>
        {patches.map((patch) => (
          <li key={patch._id} className={styles.patchItem}>
            <strong>
              {patch.version} - {patch.title}
            </strong>
            <div className={styles.patchControls}>
              <button onClick={() => startEdit(patch)}>Edit</button>
              <button
                onClick={() => handleDelete(patch._id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatchManager;
