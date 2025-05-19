import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import { useUserContext } from "../context/UserContext";
import { getApiUrl } from "../utils/env";
import PatchManager from "./Admin/PatchManager";
import ToolManager from "./Admin/ToolManager";
import PlatformStatus from "./Admin/PlatformStatus";

import styles from "../styles/AdminModules/AdminPanel.module.css";

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
      case "tools":
        return <ToolManager />;
      case "patches":
        return <PatchManager />;
      case "status":
        return <PlatformStatus />;
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
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h3>Admin Menu</h3>
          <ul className={styles.menuList}>
            <li className={styles.buttonList}>
              <button onClick={() => setView("dashboard")}>Dashboard</button>
            </li>
            <li className={styles.buttonList}>
              <button onClick={() => setView("status")}>System Status</button>
            </li>
            <li className={styles.buttonList}>
              <button onClick={() => setView("patches")}>Patches</button>
            </li>
            {/* Add more tools here later */}
            <li className={styles.buttonList}>
              <button onClick={() => setView("tools")}>Tools</button>
            </li>
          </ul>
        </div>
        <div className={styles.viewPanel}>{renderView()}</div>
      </div>
    </>
  );
};

export default AdminPanel;
