import React from "react";

const CombatStats = ({ formData, handleChange, setFormData }) => {
  return (
    <div className="combat-section">
      {/* Armor Class / Initiative / Speed */}
      <div className="combat-box-row">
        <div className="combat-box">
          <h5>Armor Class</h5>
          <input
            type="number"
            name="ac"
            value={formData.ac || 0}
            onChange={handleChange}
          />
        </div>
        <div className="combat-box">
          <h5>Initiative &nbsp;</h5>
          <input
            type="number"
            name="initiative"
            value={formData.initiative || 0}
            onChange={handleChange}
          />
        </div>
        <div className="combat-box">
          <h5>Chara Speed &nbsp;</h5>
          <input
            type="number"
            name="speed"
            value={formData.speed || 0}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Hit Points */}
      <div className="combat-box">
        <h5>Hit Point Maximum</h5>
        <input
          type="number"
          name="maxhp"
          value={formData.maxhp || 0}
          onChange={handleChange}
        />
        <h5>Current Hit Points</h5>
        <input
          type="number"
          name="currenthp"
          value={formData.currenthp || 0}
          onChange={handleChange}
        />
        <h5>Temporary Hit Points</h5>
        <input
          type="number"
          name="temphp"
          value={formData.temphp || 0}
          onChange={handleChange}
        />
      </div>

      {/* Hit Dice & Death Saves */}
      <div className="hitdice-death-box">
        <div className="combat-box hitpoints-box">
          <h5>Total Hit Dice</h5>
          <input
            type="text"
            name="hitdice"
            value={formData.hitdice || ""}
            onChange={handleChange}
          />
        </div>
        <div className="combat-box death-saves">
          <h5>Death Saves</h5>
          <div className="death-tracking">
            <div>
              <label>Successes</label>
              {[0, 1, 2].map((i) => (
                <input
                  type="checkbox"
                  key={i}
                  name={`success-${i}`}
                  checked={formData[`success-${i}`]}
                  onChange={handleChange}
                />
              ))}
            </div>
            <div>
              <label>Failures</label>
              {[0, 1, 2].map((i) => (
                <input
                  type="checkbox"
                  key={i}
                  name={`failure-${i}`}
                  checked={formData[`failure-${i}`]}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attacks & Spellcasting */}
      <div className="combat-box">
        <h5>Attacks & Spellcasting</h5>
        {formData.attacks?.map((atk, index) => (
          <div
            key={index}
            style={{
              marginBottom: "1rem",
              borderBottom: "1px solid #ccc",
              paddingBottom: "0.5rem",
            }}
          >
            <input
              type="text"
              placeholder="Name"
              value={atk.name}
              onChange={(e) => {
                const newAttacks = [...formData.attacks];
                newAttacks[index].name = e.target.value;
                setFormData((prev) => ({ ...prev, attacks: newAttacks }));
              }}
            />
            <p className="AT-Description">Weapon/Spell</p>
            <input
              type="text"
              placeholder="Attack Bonus"
              value={atk.atk}
              onChange={(e) => {
                const newAttacks = [...formData.attacks];
                newAttacks[index].atk = e.target.value;
                setFormData((prev) => ({ ...prev, attacks: newAttacks }));
              }}
            />
            <p className="AT-Description">Modifier</p>
            <input
              type="text"
              placeholder="Damage"
              value={atk.damage}
              onChange={(e) => {
                const newAttacks = [...formData.attacks];
                newAttacks[index].damage = e.target.value;
                setFormData((prev) => ({ ...prev, attacks: newAttacks }));
              }}
            />
            <p className="AT-Description">Damage</p>
            <input
              type="text"
              placeholder="Type"
              value={atk.type}
              onChange={(e) => {
                const newAttacks = [...formData.attacks];
                newAttacks[index].type = e.target.value;
                setFormData((prev) => ({ ...prev, attacks: newAttacks }));
              }}
            />
            <p className="AT-Description">Damage Type</p>
            <button
              type="button"
              onClick={() => {
                const newAttacks = formData.attacks.filter(
                  (_, i) => i !== index
                );
                setFormData((prev) => ({ ...prev, attacks: newAttacks }));
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const newAttack = { name: "", atk: "", damage: "", type: "" };
            setFormData((prev) => ({
              ...prev,
              attacks: [...(prev.attacks || []), newAttack],
            }));
          }}
        >
          Add Attack
        </button>
      </div>

      {/* Equipment Section */}
      <div className="equipment-section">
        <div className="coin-column">
          {["cp", "sp", "ep", "gp", "pp"].map((coin) => (
            <div key={coin} className="coin-input">
              <label>{coin.toUpperCase()}</label>
              <input
                type="number"
                name={`coins.${coin}`}
                value={formData.coins?.[coin] || 0}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
        <div className="equipment-notes">
          <h5>Equipment</h5>
          {formData.equipment?.map((item, index) => (
            <div
              key={index}
              className="equipment-entry"
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid #ccc",
                paddingBottom: "0.5rem",
              }}
            >
              <input
                type="text"
                placeholder="Name"
                value={item.name}
                onChange={(e) => {
                  const updated = [...formData.equipment];
                  updated[index].name = e.target.value;
                  setFormData((prev) => ({ ...prev, equipment: updated }));
                }}
              />
              <input
                type="text"
                placeholder="Description"
                value={item.desc}
                onChange={(e) => {
                  const updated = [...formData.equipment];
                  updated[index].desc = e.target.value;
                  setFormData((prev) => ({ ...prev, equipment: updated }));
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = formData.equipment.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({ ...prev, equipment: updated }));
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newItem = { name: "", desc: "" };
              setFormData((prev) => ({
                ...prev,
                equipment: [...(prev.equipment || []), newItem],
              }));
            }}
          >
            Add Equipment Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatStats;
