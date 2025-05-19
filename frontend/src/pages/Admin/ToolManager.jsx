import React, { useEffect, useState } from "react";
import { getApiUrl } from "../../utils/env";
import styles from "../../styles/AdminModules/ToolManager.module.css";

const ToolManager = () => {
  const [tools, setTools] = useState([]);
  const [form, setForm] = useState({
    name: "",
    url: "",
    description: "",
    category: "",
    featured: false,
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchTools = async () => {
    const res = await fetch(`${getApiUrl()}/api/tools`);
    const data = await res.json();
    setTools(data);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${getApiUrl()}/api/tools/${editingId}`
      : `${getApiUrl()}/api/tools`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        name: "",
        url: "",
        description: "",
        category: "",
        featured: false,
      });
      setEditingId(null);
      fetchTools();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this tool?")) return;
    await fetch(`${getApiUrl()}/api/tools/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTools();
  };

  const startEdit = (tool) => {
    setForm({
      name: tool.name,
      url: tool.url,
      description: tool.description || "",
      category: tool.category || "",
      featured: tool.featured || false,
    });
    setEditingId(tool._id);
  };

  return (
    <div className={styles.container}>
      <h2>{editingId ? "Edit Tool" : "Add New Tool"}</h2>
      <form onSubmit={handleSubmit} className={styles.toolForm}>
        <input
          type="text"
          name="name"
          placeholder="Tool Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="url"
          name="url"
          placeholder="https://example.com"
          value={form.url}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Short description..."
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category (e.g. Generators, Maps)"
          value={form.category}
          onChange={handleChange}
        />
        <label>
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />
          Featured
        </label>
        <button type="submit">{editingId ? "Update" : "Create"} Tool</button>
      </form>

      <h3 className={styles.sectionHeader}>All Tools</h3>
      <ul>
        {tools.map((tool) => (
          <li key={tool._id} className={styles.toolItem}>
            <strong>{tool.name}</strong> –{" "}
            <a href={tool.url} target="_blank" rel="noreferrer">
              {tool.url}
            </a>
            <div>
              <button onClick={() => startEdit(tool)}>Edit</button>
              <button
                onClick={() => handleDelete(tool._id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
            {tool.description && <p>{tool.description}</p>}
            {tool.category && <small>Category: {tool.category}</small>}
            {tool.featured && (
              <span style={{ marginLeft: "1rem", color: "gold" }}>
                ★ Featured
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolManager;
