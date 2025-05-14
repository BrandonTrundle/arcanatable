import React, { useRef } from "react";
import "../../styles/MonsterPreview.css";
import ParchmentPaper from "../../assets/ParchmentPaper.png";
import html2pdf from "html2pdf.js";

const MonsterPreview = ({ data }) => {
  const {
    name,
    size,
    type,
    alignment,
    armorClass,
    hitPoints,
    hitDice,
    speed,
    abilityScores,
    savingThrows,
    skills,
    damageVulnerabilities,
    damageResistances,
    damageImmunities,
    conditionImmunities,
    senses,
    languages,
    challengeRating,
    proficiencyBonus,
    traits,
    actions,
    reactions,
    legendaryActions,
    legendaryResistances,
    lairActions,
    regionalEffects,
    description,
    image,
    extraSections,
  } = data;

  const previewRef = useRef();

  const exportToPDF = () => {
    const element = previewRef.current;

    const opt = {
      margin: 0.5,
      filename: `${name.replace(/\s+/g, "_")}_StatBlock.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const renderList = (title, list) =>
    list?.length > 0 && (
      <div className="monster-section">
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
      </div>
    );

  const renderKeyValueList = (title, obj) =>
    obj &&
    Object.keys(obj).length > 0 && (
      <div className="monster-section">
        <h3>{title}</h3>
        <ul>
          {Object.entries(obj).map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {v}
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <>
      <button className="pdf-export-btn" onClick={exportToPDF}>
        📄 Export as PDF
      </button>

      <div
        ref={previewRef}
        className="monster-preview"
        style={{
          backgroundImage: `url(${ParchmentPaper})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {image && (
          <div className="monster-image-wrapper">
            <img
              src={
                image?.startsWith("/uploads")
                  ? `${import.meta.env.VITE_API_URL}${image}`
                  : image
              }
              alt={`${name} art`}
              className="monster-image"
            />
          </div>
        )}

        <h1 className="monster-name">{name}</h1>
        <h2 className="monster-subtype">{`${size} ${type}, ${alignment}`}</h2>

        <div className="monster-statblock">
          <div>
            <strong>AC:</strong> {armorClass}
          </div>
          <div>
            <strong>HP:</strong> {hitPoints} ({hitDice})
          </div>
          <div>
            <strong>Speed:</strong>{" "}
            {Object.entries(speed || {})
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </div>
          <div className="monster-section">
            <h3>Challenge & Proficiency</h3>
            <p>
              <strong>Challenge Rating:</strong> {challengeRating}
            </p>
            <p>
              <strong>Proficiency Bonus:</strong> {proficiencyBonus}
            </p>
          </div>
          <div>
            <strong>Languages:</strong> {languages}
          </div>
        </div>

        <div className="monster-abilities">
          {Object.entries(abilityScores).map(([attr, val]) => (
            <div key={attr}>
              <strong>{attr.toUpperCase()}:</strong> {val}
            </div>
          ))}
        </div>

        {renderKeyValueList("Saving Throws", savingThrows)}
        {renderKeyValueList("Skills", skills)}

        {damageVulnerabilities?.length > 0 && (
          <p>
            <strong>Vulnerabilities:</strong> {damageVulnerabilities.join(", ")}
          </p>
        )}
        {damageResistances?.length > 0 && (
          <p>
            <strong>Resistances:</strong> {damageResistances.join(", ")}
          </p>
        )}
        {damageImmunities?.length > 0 && (
          <p>
            <strong>Immunities:</strong> {damageImmunities.join(", ")}
          </p>
        )}
        {conditionImmunities?.length > 0 && (
          <p>
            <strong>Condition Immunities:</strong>{" "}
            {conditionImmunities.join(", ")}
          </p>
        )}

        {Object.keys(senses).length > 0 && (
          <p>
            <strong>Senses:</strong>{" "}
            {Object.entries(senses)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </p>
        )}

        {renderList("Traits", traits)}
        {renderList("Actions", actions)}
        {renderList("Reactions", reactions)}

        {legendaryResistances?.length > 0 && (
          <div className="monster-section">
            <h3>Legendary Resistance</h3>
            <ul>
              {legendaryResistances.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.name}:</strong> {item.desc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {renderList("Legendary Actions", legendaryActions)}
        {renderList("Lair Actions", lairActions)}
        {renderList("Regional Effects", regionalEffects)}

        {description && (
          <div className="monster-section">
            <h3>Description</h3>
            {description.split("\n\n").map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        )}

        {extraSections?.length > 0 && (
          <div className="monster-section">
            <h3>Custom Sections</h3>
            {extraSections.map((section, i) => (
              <div key={i} className="custom-section-block">
                <h4>{section.title}</h4>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MonsterPreview;
