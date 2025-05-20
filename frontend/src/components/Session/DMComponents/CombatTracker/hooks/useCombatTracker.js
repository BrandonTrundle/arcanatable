import { useState, useCallback } from "react";

const useCombatTracker = () => {
  const [combatState, setCombatState] = useState({
    round: 1,
    turnIndex: 0,
    combatants: [],
  });

  const initializeCombat = useCallback((tokenList) => {
    const initialized = tokenList.map((token) => ({
      tokenId: token.id,
      name: token.name,
      currentHP: token.currentHP,
      maxHP: token.maxHP,
      initiative: null,
      initiativeMod: token.initiativeMod || 0, // ✅ This is the line you're adding
      conditions: [],
      controlledBy: token.layer === "dm" ? "dm" : "player",
    }));
    setCombatState((prev) => ({ ...prev, combatants: initialized }));
  }, []);

  const setInitiative = useCallback((tokenId, value) => {
    setCombatState((prev) => ({
      ...prev,
      combatants: prev.combatants.map((c) =>
        c.tokenId === tokenId ? { ...c, initiative: value } : c
      ),
    }));
  }, []);

  const autoRollInitiative = useCallback(() => {
    setCombatState((prev) => {
      const updated = prev.combatants.map((c) => {
        if (c.initiative != null) return c;

        const roll = Math.floor(Math.random() * 20) + 1;
        const mod = parseInt(c.initiativeMod) || 0;
        const total = roll + mod;

        console.log(
          `🧮 Rolling initiative for ${c.name}: d20 = ${roll}, mod = ${mod}, total = ${total}`
        );

        return {
          ...c,
          initiative: total,
        };
      });

      updated.sort((a, b) => b.initiative - a.initiative);
      return { ...prev, combatants: updated };
    });
  }, []);

  const nextTurn = useCallback(() => {
    setCombatState((prev) => {
      const nextIndex = prev.turnIndex + 1;
      const wrapped = nextIndex >= prev.combatants.length;
      return {
        ...prev,
        round: wrapped ? prev.round + 1 : prev.round,
        turnIndex: wrapped ? 0 : nextIndex,
      };
    });
  }, []);

  const updateHP = (tokenId, newCurrentHP, newMaxHP) => {
    console.log("🛠 updateHP called:", { tokenId, newCurrentHP, newMaxHP });

    setCombatState((prev) => {
      const updatedCombatants = prev.combatants.map((c) => {
        if (c.tokenId !== tokenId) return c;

        const updated = {
          ...c,
          currentHP: newCurrentHP,
          maxHP: newMaxHP,
        };

        console.log("🔄 Updated combatant HP:", updated);
        return updated;
      });

      return {
        ...prev,
        combatants: updatedCombatants,
      };
    });
  };

  const addCondition = useCallback((tokenId, condition) => {
    setCombatState((prev) => ({
      ...prev,
      combatants: prev.combatants.map((c) =>
        c.tokenId === tokenId
          ? {
              ...c,
              conditions: [...new Set([...c.conditions, condition])],
            }
          : c
      ),
    }));
  }, []);

  const removeCondition = useCallback((tokenId, condition) => {
    setCombatState((prev) => ({
      ...prev,
      combatants: prev.combatants.map((c) =>
        c.tokenId === tokenId
          ? {
              ...c,
              conditions: c.conditions.filter((cond) => cond !== condition),
            }
          : c
      ),
    }));
  }, []);

  const syncCombatantsWithTokens = useCallback((tokens) => {
    if (!tokens || tokens.length === 0) {
      console.log("🧹 All tokens removed — resetting combatants.");
      setCombatState((prev) => ({
        ...prev,
        combatants: [],
      }));
      return;
    }

    setCombatState((prev) => {
      console.log("[syncCombatantsWithTokens] Incoming tokens:", tokens);
      console.log(
        "[syncCombatantsWithTokens] Existing combatants:",
        prev.combatants
      );

      const currentTokenIds = new Set(tokens.map((t) => String(t.id)));

      const filteredCombatants = prev.combatants.filter((c) => {
        const tokenId = c.tokenId;
        const keep = tokenId && currentTokenIds.has(String(tokenId));
        if (!keep) {
          console.log("🧹 Removing combatant:", c.name, "— tokenId:", tokenId);
        }
        return keep;
      });

      const existingCombatantIds = new Set(
        filteredCombatants.map((c) => String(c.tokenId))
      );

      const newCombatants = tokens
        .filter((token) => !existingCombatantIds.has(String(token.id)))
        .map((token) => ({
          tokenId: token.id,
          name: token.name,
          currentHP: token.currentHP,
          maxHP: token.maxHP,
          initiative: null,
          initiativeMod: token.initiativeMod || 0,
          conditions: [],
          controlledBy: token.layer === "dm" ? "dm" : "player",
        }));
      console.log(
        "[useCombatTracker.js] syncCombatantsWithTokens — BEFORE update. prev combatState:",
        prev
      );

      return {
        ...prev,
        combatants: [...filteredCombatants, ...newCombatants],
      };
    });
  }, []);

  return {
    combatState,
    setCombatState, // ✅ expose this
    initializeCombat,
    syncCombatantsWithTokens,
    setInitiative,
    autoRollInitiative,
    nextTurn,
    updateHP,
    addCondition,
    removeCondition,
  };
};

export default useCombatTracker;
