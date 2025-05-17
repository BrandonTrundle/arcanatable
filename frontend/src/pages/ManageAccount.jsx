import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import Navbar from "../components/Auth/Navbar";
import { getApiUrl } from "../utils/env";

const ManageAccount = () => {
  const { user, setUser } = useUserContext();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "", // only update if changed
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiUrl()}/api/users/update-profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const updated = await res.json();
      setUser((prev) => ({ ...prev, ...updated }));
      alert("Profile updated!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update account.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="manage-account-page" style={{ padding: "2rem" }}>
        <h1>Manage Account</h1>
        <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
          <div>
            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              placeholder="Leave blank to keep current"
            />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default ManageAccount;
