import React, { useState, useEffect } from "react";
import d4 from "../../../assets/d4logo.png";
import d6 from "../../../assets/d6logo.png";
import d8 from "../../../assets/d8logo.png";
import d10 from "../../../assets/d10logo.png";
import d12 from "../../../assets/d12logo.png";
import d20 from "../../../assets/d20logo.png";
import d100 from "../../../assets/d100logo.png";
import diceRollSfx from "../../../assets/diceroll.mp3";
import "../../../styles/DiceRoller.css";

const diceOptions = [
  { label: "d4", value: 4, icon: d4 },
  { label: "d6", value: 6, icon: d6 },
  { label: "d8", value: 8, icon: d8 },
  { label: "d10", value: 10, icon: d10 },
  { label: "d12", value: 12, icon: d12 },
  { label: "d20", value: 20, icon: d20 },
  { label: "d100", value: 100, icon: d100 },
];

const DiceRoller = ({ userId, campaignId, username, isDM, socket }) => {
  const [selectedDie, setSelectedDie] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState("normal"); // 'normal' | 'advantage' | 'disadvantage'
  const [isSecret, setIsSecret] = useState(false);
  const [savedRolls, setSavedRolls] = useState([]);
  const diceAudio = new Audio(diceRollSfx);
  diceAudio.volume = 0.6; // optional: tone it down

  // Placeholder: fetch saved rolls on load
  useEffect(() => {
    // TODO: Replace with actual API call
    setSavedRolls([]);
  }, [userId, campaignId]);

  useEffect(() => {
    const fetchSavedRolls = async () => {
      try {
        const res = await fetch(`/api/dicerolls/${campaignId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load saved rolls");

        const data = await res.json();
        setSavedRolls(data);
      } catch (err) {
        console.error("❌ Error fetching saved rolls:", err);
      }
    };

    fetchSavedRolls();
  }, [campaignId, userId]);

  const handleRoll = () => {
    diceAudio.currentTime = 0;
    diceAudio.play().catch((err) => {
      // Some browsers block autoplay — this prevents errors in console
      console.warn("🎵 Dice roll sound blocked or failed:", err);
    });
    const rolls = [];
    const die = selectedDie;
    const rollDie = () => Math.ceil(Math.random() * die);

    if (die === 20 && advantage !== "normal") {
      const first = rollDie();
      const second = rollDie();
      const chosen =
        advantage === "advantage"
          ? Math.max(first, second)
          : Math.min(first, second);
      rolls.push({ first, second, chosen });
    } else {
      for (let i = 0; i < quantity; i++) {
        rolls.push(rollDie());
      }
    }

    const total =
      rolls.reduce((sum, r) => {
        if (typeof r === "number") return sum + r;
        return sum + r.chosen;
      }, 0) + modifier;

    let rollText = "";
    if (die === 20 && advantage !== "normal") {
      rollText = `${quantity}d${die} (${advantage}): ${rolls[0].first} vs ${rolls[0].second} → ${rolls[0].chosen}`;
    } else {
      rollText = `${quantity}d${die}${
        modifier !== 0 ? ` + ${modifier}` : ""
      }: [${rolls.join(", ")}] = ${total}`;
    }

    let colorClass = "";
    if (die === 20 && quantity === 1 && advantage === "normal") {
      const result = rolls[0];
      if (result === 20) colorClass = "nat-20";
      else if (result === 1) colorClass = "nat-1";
    }

    const chatMessage = {
      campaignId,
      username: `🎲 ${username} rolled`,
      text: rollText,
      timestamp: new Date().toISOString(),
      colorClass,
    };

    if (isSecret && isDM) {
      socket.emit("secretRoll", { ...chatMessage, targetUserId: userId });
    } else {
      socket.emit("chatMessage", chatMessage);
    }
  };

  const handleSaveRoll = async () => {
    const name = prompt("Name this roll:");

    if (!name || name.trim() === "") return;

    const payload = {
      campaignId,
      name: name.trim(),
      quantity,
      die: selectedDie,
      modifier,
      advantage,
    };

    try {
      const res = await fetch("/api/dicerolls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save roll");

      const newRoll = await res.json();
      setSavedRolls((prev) => [newRoll, ...prev]);
    } catch (err) {
      console.error("❌ Error saving roll:", err);
    }
  };

  return (
    <div className="dice-roller-panel">
      <h3>🎲 Dice Roller</h3>
      <div className="dice-selector">
        {diceOptions.map((die) => (
          <img
            key={die.value}
            src={die.icon}
            alt={die.label}
            className={`dice-icon ${
              selectedDie === die.value ? "selected" : ""
            }`}
            onClick={() => setSelectedDie(die.value)}
          />
        ))}
      </div>

      <div className="dice-settings">
        <label>
          Quantity:
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          Modifier:
          <input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value, 10))}
          />
        </label>
        {selectedDie === 20 && (
          <div className="advantage-toggle">
            <label>
              <input
                type="radio"
                value="normal"
                checked={advantage === "normal"}
                onChange={(e) => setAdvantage(e.target.value)}
              />
              Normal
            </label>
            <label>
              <input
                type="radio"
                value="advantage"
                checked={advantage === "advantage"}
                onChange={(e) => setAdvantage(e.target.value)}
              />
              Advantage
            </label>
            <label>
              <input
                type="radio"
                value="disadvantage"
                checked={advantage === "disadvantage"}
                onChange={(e) => setAdvantage(e.target.value)}
              />
              Disadvantage
            </label>
          </div>
        )}
      </div>

      {isDM && (
        <div className="secret-roll-toggle">
          <label>
            <input
              type="checkbox"
              checked={isSecret}
              onChange={() => setIsSecret(!isSecret)}
            />
            Secret Roll (DM only)
          </label>
        </div>
      )}

      <button onClick={handleRoll}>🎲 Roll</button>
      <button onClick={handleSaveRoll}>💾 Save Roll</button>

      <div className="saved-rolls">
        <h4>📁 Saved Rolls</h4>
        {savedRolls.map((roll) => (
          <div key={roll._id} className="saved-roll">
            <span>{roll.name}</span>
            <button
              onClick={() => {
                setSelectedDie(roll.die);
                setQuantity(roll.quantity);
                setModifier(roll.modifier);
                setAdvantage(roll.advantage);
                handleRoll(); // Use restored state to roll
              }}
            >
              Roll
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/dicerolls/${roll._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });

                  if (!res.ok) throw new Error("Failed to delete");

                  setSavedRolls((prev) =>
                    prev.filter((r) => r._id !== roll._id)
                  );
                } catch (err) {
                  console.error("❌ Error deleting roll:", err);
                }
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
