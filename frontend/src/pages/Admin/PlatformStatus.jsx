import React, { useEffect, useState } from "react";
import styles from "../../styles/AdminModules/PlatformStatus.module.css";
import { getApiUrl } from "../../utils/env";

const PlatformStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/platform-status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch platform status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) return <div className={styles.loading}>Loading status...</div>;
  if (!data)
    return <div className={styles.error}>Error loading platform status.</div>;

  const renderMongoDetails = (info) => {
    return (
      <div className={styles.mongoDetails}>
        <p>
          <strong>Cluster:</strong> {info.clusterName}
        </p>
        <p>
          <strong>Status:</strong> {info.state}
        </p>
        <p>
          <strong>Paused:</strong> {info.paused ? "Yes" : "No"}
        </p>
        <p>
          <strong>MongoDB Version:</strong> {info.mongoDBVersion}
        </p>
        <p>
          <strong>Instance Size:</strong> {info.instanceSize}
        </p>
        <p>
          <strong>Provider:</strong> {info.provider}
        </p>
        <p>
          <strong>Cluster Type:</strong> {info.clusterType}
        </p>
        <p>
          <strong>Disk Size:</strong> {info.diskSizeGB} GB
        </p>
        <p>
          <strong>Auto Scaling:</strong> Compute{" "}
          {info.autoScaling.compute ? "✔️" : "❌"}, Disk{" "}
          {info.autoScaling.disk ? "✔️" : "❌"}
        </p>
        <p>
          <strong>Connection String:</strong>{" "}
          <code>{info.connectionStrings?.standardSrv}</code>
        </p>
      </div>
    );
  };

  const renderSection = (title, info) => {
    if (!info) {
      return (
        <div className={styles.card}>
          <h3>{title}</h3>
          <p className={styles.errorText}>⚠️ No data available.</p>
        </div>
      );
    }

    if (title === "🟢 Supabase") {
      return (
        <div className={styles.card}>
          <h3>{title}</h3>
          <p>
            View detailed usage at:{" "}
            <a href={info.billingUrl} target="_blank" rel="noreferrer">
              Supabase Billing Dashboard
            </a>
          </p>
          {info.error && <p className={styles.errorText}>⚠️ {info.error}</p>}
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <h3>{title}</h3>
        {info.error ? (
          <p className={styles.errorText}>⚠️ {info.error}</p>
        ) : title === "🍃 MongoDB Atlas" ? (
          renderMongoDetails(info)
        ) : title.includes("Render") ? (
          renderRenderDetails(info)
        ) : (
          <pre>{JSON.stringify(info, null, 2)}</pre>
        )}
      </div>
    );
  };

  const renderRenderDetails = (info) => {
    const isBackend = info.type === "web_service";
    const details = info.serviceDetails || {};

    return (
      <div className={styles.renderDetails}>
        <p>
          <strong>Name:</strong> {info.name}
        </p>
        <p>
          <strong>Repo:</strong>{" "}
          <a href={info.repo} target="_blank" rel="noreferrer">
            {info.repo}
          </a>
        </p>
        <p>
          <strong>Branch:</strong> {info.branch}
        </p>
        <p>
          <strong>Auto Deploy:</strong>{" "}
          {info.autoDeploy === "yes" ? "✔️" : "❌"} (Trigger:{" "}
          {info.autoDeployTrigger})
        </p>
        <p>
          <strong>Plan:</strong> {details.plan || details.buildPlan}
        </p>
        <p>
          <strong>Region:</strong> {details.region || "—"}
        </p>
        <p>
          <strong>URL:</strong>{" "}
          <a href={details.url} target="_blank" rel="noreferrer">
            {details.url}
          </a>
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {info.suspended === "not_suspended" ? "🟢 Running" : "⛔ Suspended"}
        </p>
        {isBackend && (
          <>
            <p>
              <strong>Start Command:</strong>{" "}
              {details.envSpecificDetails?.startCommand || "—"}
            </p>
            <p>
              <strong>Runtime:</strong> {details.runtime}
            </p>
          </>
        )}
        <p>
          <strong>Dashboard:</strong>{" "}
          <a href={info.dashboardUrl} target="_blank" rel="noreferrer">
            View on Render
          </a>
        </p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Platform Status</h2>
      <div className={styles.grid}>
        {renderSection("🟢 Supabase", data.supabase)}
        {renderSection("🍃 MongoDB Atlas", data.mongodb)}
        {renderSection("🚀 Render: Backend", data.render?.backend || {})}
        {renderSection("🎨 Render: Frontend", data.render?.frontend || {})}
      </div>
    </div>
  );
};

export default PlatformStatus;
