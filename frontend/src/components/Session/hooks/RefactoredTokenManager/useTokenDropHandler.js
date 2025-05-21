import { useContext } from "react";
import { UserContext } from "../../../../context/UserContext";

export const useTokenDropHandler = ({
  tokenTemplates,
  tokens,
  setTokens,
  emitTokenUpdate,
  useRolledHP,
  isDM,
  socket,
  map,
}) => {
  const { user } = useContext(UserContext); // ✅ move here

  const handleDrop = async ({ trueX, trueY, originalEvent }) => {
    const cellSize = 70;
    const cellX = Math.floor(trueX / cellSize);
    const cellY = Math.floor(trueY / cellSize);

    const snappedX = cellX * cellSize + cellSize / 2;
    const snappedY = cellY * cellSize + cellSize / 2;
    try {
      console.log("[useTokenDropHandler] handleDrop triggered");

      const rawData =
        originalEvent?.nativeEvent?.dataTransfer?.getData("application/json");
      if (!rawData) {
        console.warn("⚠️ No token payload found in dataTransfer.");
        return;
      }

      const dragged = JSON.parse(rawData);
      console.log("[useTokenDropHandler] JSON Parsed date:", rawData);
      const templateId = dragged.id;
      if (!templateId) return;

      const template = tokenTemplates?.find?.((t) => t.id === templateId);
      const isCharacterDrop = !template && dragged.layer === "player";

      let base = {};
      let baseName = "Unknown";
      let imageUrl = dragged.imageUrl;
      let size = dragged.tokenSize || "Medium";
      let sourceType = "custom";
      let maxHP = 10;
      let currentHP; // ✅ required to define before assignment

      if (template) {
        base = template.content || {};
        baseName = template.title || base.name || "Unknown";
        imageUrl =
          base.image || base.avatar || base.imageUrl || dragged.imageUrl;
        size = base.tokenSize || "Medium";
        sourceType = template.type || "custom";

        if (useRolledHP && base.hitDice && isValidDiceString(base.hitDice)) {
          maxHP = rollDiceFormula(base.hitDice);
        } else if (!isNaN(Number(base.hitPoints))) {
          maxHP = Number(base.hitPoints);
        }
      } else if (isCharacterDrop) {
        base = dragged;
        baseName = dragged.name || "Unnamed Hero";
        imageUrl = dragged.imageUrl;
        size = dragged.tokenSize || "Medium";
        sourceType = "character";

        // ✅ Pull from character fields
        maxHP = dragged.maxhp ?? 10;
        currentHP = dragged.currenthp ?? maxHP;
      } else {
        console.warn("⚠️ Token template not found for:", templateId);
        return;
      }

      const uniqueName = generateUniqueTokenName(baseName, tokens);
      const uniqueId = `${templateId}_${Date.now()}`;
      maxHP = typeof maxHP === "number" ? maxHP : 10;
      currentHP = typeof currentHP === "number" ? currentHP : maxHP;

      const newToken = {
        id: uniqueId,
        name: uniqueName,
        originalName: baseName,
        baseTemplateId: templateId,
        imageUrl,
        tokenSize: size,
        x: snappedX,
        y: snappedY,
        cellX,
        cellY,
        layer: dragged.layer || "player",
        sourceType,
        maxHP,
        currentHP,
        initiative: null,
        initiativeMod: parseInt(base.initiative) || 0, // 👈 Add this
        conditions: [],
        notes: "",
        controller: user._id,
      };
      //   console.log("🧮 Token initiative mod:", newToken.initiativeMod);
      //   console.log("[useTokenDropHandler] Constructed new token:", newToken);

      setTokens((prev) => {
        const updatedTokens = [...prev, newToken];
        emitTokenUpdate(updatedTokens);

        // 👇 Emit new token to DM if player
        if (!isDM && socket) {
          socket.emit("playerDroppedToken", {
            mapId: map._id,
            campaignId: map.content.campaign,
            token: newToken,
          });
        }
        //  console.log(
        //    "📤 [useTokenDropHandler] Emitted playerDroppedToken:",
        //    newToken
        //  );

        return updatedTokens;
      });
    } catch (err) {
      console.error("❌ Error handling token drop:", err);
    }
  };

  const rollDiceFormula = (formula) => {
    const match = formula.match(/(\d+)d(\d+)(\s*\+\s*(\d+))?/);
    if (!match) return 0;

    const [, num, sides, , bonus] = match.map(Number);
    let total = 0;
    for (let i = 0; i < num; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total + (bonus || 0);
  };

  const isValidDiceString = (str) => {
    return /^\d+d\d+(\s*\+\s*\d+)?$/.test(str);
  };

  const generateUniqueTokenName = (baseName, existingTokens) => {
    const nameRegex = new RegExp(`^${baseName}(?: (\\d+))?$`, "i");
    let maxNumber = 0;

    existingTokens.forEach((token) => {
      const match = token.name?.match(nameRegex);
      if (match) {
        const number = match[1] ? parseInt(match[1], 10) : 0;
        if (number >= maxNumber) {
          maxNumber = number + 1;
        }
      }
    });

    return maxNumber > 0 ? `${baseName} ${maxNumber}` : baseName;
  };

  return handleDrop;
};
