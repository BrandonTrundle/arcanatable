import React from "react";
import "../../styles/NPCPreview.css";
import ParchmentPaper from "../../assets/ParchmentPaper.png";

const NPCPreview = ({ data }) => {
  const {
    name,
    race,
    class: npcClass,
    gender,
    age,
    alignment,
    background,
    occupation,
    tokenSize,
    armorClass,
    hitPoints,
    hitDice,
    speed,
    proficiencyBonus,
    challengeRating,
    languages = [],
    abilityScores = {},
    savingThrows = {},
    skills = {},
    senses = {},
    damageResistances = [],
    conditionImmunities = [],
    traits = [],
    actions = [],
    spells = {},
    description = "",
    image,
  } = data;

  const renderKeyValueList = (title, obj) =>
    obj &&
    Object.keys(obj).length > 0 && (
      <>
        <h3>{title}</h3>
        {Object.entries(obj).map(([k, v]) => (
          <p key={k}>
            <strong>{k}:</strong> {v}
          </p>
        ))}
      </>
    );

  const renderList = (title, list) =>
    list?.length > 0 && (
      <>
        <h3>{title}</h3>
        <ul>
          {list.map((item, idx) =>
            typeof item === "string" ? (
              <li key={idx}>{item}</li>
            ) : (
              <li key={idx}>
                <strong>{item.name}:</strong> {item.desc}
              </li>
            )
          )}
        </ul>
      </>
    );

  return (
    <div
      className="npc-preview"
      style={{
        backgroundImage: `url(${ParchmentPaper})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {image && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src={
              typeof image === "string"
                ? image.startsWith("/uploads")
                  ? `${import.meta.env.VITE_API_URL}${image}`
                  : image
                : image instanceof File
                ? URL.createObjectURL(image)
                : ""
            }
            alt={`${name} portrait`}
            style={{
              maxWidth: "100%",
              maxHeight: "350px",
              objectFit: "contain",
              borderRadius: "12px",
            }}
          />
        </div>
      )}

      <h1>{name}</h1>
      <h2>{`${race} ${npcClass}`}</h2>
      <p>
        <em>
          {alignment}, Age {age}, Gender: {gender}, Background: {background}
        </em>
      </p>
      <p>
        <strong>Occupation:</strong> {occupation}
      </p>

      <hr />
      <h3>Core Stats</h3>
      <p>
        <strong>Armor Class:</strong> {armorClass}
      </p>
      <p>
        <strong>Hit Points:</strong> {hitPoints} ({hitDice})
      </p>
      <p>
        <strong>Speed:</strong> {speed}
      </p>
      <p>
        <strong>Challenge Rating:</strong> {challengeRating}
      </p>
      <p>
        <strong>Proficiency Bonus:</strong> {proficiencyBonus}
      </p>
      <p>
        <strong>Token Size:</strong> {tokenSize}
      </p>
      <p>
        <strong>Languages:</strong> {languages.join(", ")}
      </p>

      <hr />
      <h3>Ability Scores</h3>
      <ul>
        {Object.entries(abilityScores).map(([attr, val]) => (
          <li key={attr}>
            <strong>{attr.toUpperCase()}:</strong> {val}
          </li>
        ))}
      </ul>

      {renderKeyValueList("Saving Throws", savingThrows)}
      {renderKeyValueList("Skills", skills)}

      {damageResistances.length > 0 && (
        <p>
          <strong>Damage Resistances:</strong> {damageResistances.join(", ")}
        </p>
      )}
      {conditionImmunities.length > 0 && (
        <p>
          <strong>Condition Immunities:</strong>{" "}
          {conditionImmunities.join(", ")}
        </p>
      )}

      {senses?.passivePerception && (
        <p>
          <strong>Passive Perception:</strong> {senses.passivePerception}
        </p>
      )}

      {renderList("Traits", traits)}
      {renderList("Actions", actions)}

      {spells.cantrips?.length > 0 && renderList("Cantrips", spells.cantrips)}
      {spells.level1?.length > 0 &&
        renderList("1st-Level Spells", spells.level1)}

      {description && (
        <>
          <h3>Description</h3>
          <p>{description}</p>
        </>
      )}
    </div>
  );
};

export default NPCPreview;
