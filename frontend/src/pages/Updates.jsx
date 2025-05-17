import React, { useEffect, useState } from "react";
import Navbar from "../components/Auth/Navbar";
import { getApiUrl } from "../utils/env";

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

  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>ArcanaTable Updates</h1>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button onClick={() => setTab("patches")}>Patches</button>
          <button onClick={() => setTab("upcoming")}>Upcoming</button>
        </div>

        {tab === "patches" &&
          patches.map((patch) => (
            <div
              key={patch._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.5rem",
                background: "#f9f9f9",
                cursor: "pointer",
              }}
              onClick={() => togglePatch(patch._id)}
            >
              <h2 style={{ margin: 0 }}>
                {patch.version} – {patch.title}
              </h2>
              {expandedPatchId === patch._id && (
                <>
                  <small>
                    Posted {new Date(patch.createdAt).toLocaleDateString()}
                  </small>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      marginTop: "1rem",
                      fontFamily: "inherit",
                    }}
                  >
                    {patch.content}
                  </pre>
                </>
              )}
            </div>
          ))}

        {tab === "upcoming" && (
          <div>
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
