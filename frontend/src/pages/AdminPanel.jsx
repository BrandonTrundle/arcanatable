import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import { useUserContext } from "../context/UserContext";
import { getApiUrl } from "../utils/env";
import PatchManager from "./Admin/PatchManager";

const AdminPanel = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${getApiUrl()}/api/admin/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error(err);
        setMessage("Access denied or error fetching admin data.");
      });
  }, []);

  const renderView = () => {
    switch (view) {
      case "patches":
        return <PatchManager />;
      case "dashboard":
      default:
        return (
          <div>
            <p>{message || "Loading..."}</p>
            <p>Select an option from the admin menu.</p>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", padding: "2rem", gap: "2rem" }}>
        <div style={{ minWidth: "200px" }}>
          <h3>Admin Menu</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <button onClick={() => setView("dashboard")}>Dashboard</button>
            </li>
            <li>
              <button onClick={() => setView("patches")}>Patches</button>
            </li>
            {/* Add more tools here later */}
          </ul>
        </div>
        <div style={{ flexGrow: 1 }}>{renderView()}</div>
      </div>
    </>
  );
};

export default AdminPanel;
