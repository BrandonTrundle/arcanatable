import React, { useEffect, useState } from "react";
import Navbar from "../components/Auth/Navbar";
import { getApiUrl } from "../utils/env";
import styles from "../styles/PublicModules/Updates.module.css";

const Updates = () => {
  const [patches, setPatches] = useState([]);
  const [expandedPatchId, setExpandedPatchId] = useState(null);
  const [tab, setTab] = useState("patches");

  useEffect(() => {
    fetch(`${getApiUrl()}/api/patches`)
      .then((res) => res.json())
      .then((data) => setPatches(data))
      .catch((err) => console.error("Failed to fetch patches:", err));
  }, []);

  const togglePatch = (id) => {
    setExpandedPatchId((prev) => (prev === id ? null : id));
  };

  const renderBadge = (tag) => {
    const labelMap = {
      feature: "✨ Feature",
      fix: "🐛 Fix",
      tweak: "🔧 Tweak",
      beta: "🧪 Beta",
      update: "📦 Update",
    };

    return (
      <span className={`${styles.badge} ${styles[tag]}`}>
        {labelMap[tag] || "📦 Update"}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>ArcanaTable Updates</h1>
        <div className={styles.tabButtons}>
          <button
            onClick={() => setTab("patches")}
            className={tab === "patches" ? styles.activeTab : ""}
          >
            Patches
          </button>
          <button
            onClick={() => setTab("upcoming")}
            className={tab === "upcoming" ? styles.activeTab : ""}
          >
            Upcoming
          </button>
        </div>

        {tab === "patches" && (
          <div className={styles.timeline}>
            {patches.map((patch) => (
              <div
                key={patch._id}
                className={styles.timelineItem}
                onClick={() => togglePatch(patch._id)}
              >
                <div className={styles.dot}></div>
                <div className={styles.patchContentWrapper}>
                  <div className={styles.patchHeader}>
                    <h2 className={styles.patchTitle}>
                      {patch.version} – {patch.title}
                    </h2>
                    {renderBadge(patch.tag)}
                  </div>
                  <small className={styles.patchDate}>
                    {new Date(patch.createdAt).toLocaleDateString()}
                  </small>
                  {expandedPatchId === patch._id && (
                    <pre className={styles.patchContent}>{patch.content}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "upcoming" && (
          <div className={styles.upcomingSection}>
            <h2>Planned Features</h2>
            <ul>
              <li>Forum system on Community page</li>
              <li>Module creation + installation in Marketplace</li>
              <li>Session recording and playback</li>
              <li>Advanced DM tools: AI generators, encounter builder</li>
              <li>Custom dice roll scripting system</li>
              <li>User analytics dashboard</li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Updates;
