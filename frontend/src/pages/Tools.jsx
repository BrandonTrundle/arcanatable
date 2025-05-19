import React, { useEffect, useState } from "react";
import Navbar from "../components/Auth/Navbar";
import { getApiUrl } from "../utils/env";
import styles from "../styles/PublicModules/Tools.module.css";

const Tools = () => {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    fetch(`${getApiUrl()}/api/tools`)
      .then((res) => res.json())
      .then((data) => setTools(data))
      .catch((err) => console.error("Failed to fetch tools:", err));
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Tools & Resources</h1>
        <p className={styles.pageIntro}>
          A curated list of free, open-source, and helpful TTRPG tools.
          Hand-picked by the ArcanaTable team.
        </p>

        <ul className={styles.toolList}>
          {tools.map((tool) => (
            <li key={tool._id} className={styles.toolItem}>
              <div className={styles.toolHeader}>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.toolName}
                >
                  {tool.name}
                </a>
                {tool.featured && (
                  <span className={styles.featuredBadge}>★ Featured</span>
                )}
              </div>
              {tool.description && (
                <p className={styles.toolDescription}>{tool.description}</p>
              )}
              {tool.category && (
                <p className={styles.toolCategory}>Category: {tool.category}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Tools;
