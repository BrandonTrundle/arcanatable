import React, { useState, useRef, useEffect } from "react";
import styles from "../../../../styles/CombatTrackerPanel.module.css";
import useCombatTracker from "../CombatTracker/hooks/useCombatTracker";

const CombatTrackerPanel = ({
  onClose,
  isCombatMode,
  setIsCombatMode,
  combatState,
  setInitiative,
  autoRollInitiative,
  updateHP,
  addCondition,
  removeCondition,
}) => {
  const panelRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });
  //console.log("🧪 CombatTrackerPanel rendering combatState:", combatState);

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        position: "fixed",
        zIndex: 999,
      }}
    >
      <div className={styles.header} onMouseDown={handleMouseDown}>
        <span>⚔️ Combat Tracker</span>
        <div className={styles.controls}>
          <button onClick={() => setCollapsed((prev) => !prev)}>⤢</button>
          <button onClick={onClose}>✖</button>
        </div>
      </div>

      <button
        onClick={() => setIsCombatMode((prev) => !prev)}
        style={{
          margin: "10px 0",
          padding: "0.4rem 0.8rem",
          backgroundColor: isCombatMode ? "#b00" : "#2d2d2d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          width: "100%",
        }}
      >
        {isCombatMode ? "🔚 End Combat" : "⚔️ Enter Combat"}
      </button>

      {isCombatMode && (
        <button
          onClick={autoRollInitiative}
          style={{
            marginBottom: "10px",
            padding: "0.4rem 0.8rem",
            backgroundColor: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          🎲 Auto-Roll Initiative
        </button>
      )}

      {!collapsed && (
        <div className={styles.body}>
          <h4>🧠 Initiative Order</h4>
          <ol>
            {combatState.combatants
              .slice()
              .sort((a, b) => b.initiative - a.initiative)
              .map((c) => (
                <li key={c.tokenId}>
                  <strong>{c.name}</strong> — 🧮 Init:
                  <input
                    type="number"
                    value={c.initiative ?? ""}
                    onChange={(e) =>
                      setInitiative(c.tokenId, parseInt(e.target.value) || 0)
                    }
                    style={{
                      width: "3rem",
                      marginLeft: "0.5rem",
                      fontSize: "0.9rem",
                      padding: "2px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />{" "}
                  | ❤️ {c.currentHP}/{c.maxHP}
                  <br />
                  🧷 Conditions:{" "}
                  {c.conditions.length ? c.conditions.join(", ") : "None"}
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default CombatTrackerPanel;
