const emptyCharacter = {
  // Core identity
  charname: "",
  playername: "",
  class: "",
  level: 1,
  race: "",
  background: "",
  alignment: "",
  experiencepoints: 0,

  // Appearance and Social
  portraitImage: "",
  appearance: "",
  age: "",
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",

  // Ability Scores
  strscore: 0,
  strmod: 0,
  dexscore: 0,
  dexmod: 0,
  conscore: 0,
  conmod: 0,
  intscore: 0,
  intmod: 0,
  wisscore: 0,
  wismod: 0,
  chascore: 0,
  chamod: 0,

  // Saving Throws
  "strength-save": 0,
  "strength-save-prof": false,
  "dexterity-save": 0,
  "dexterity-save-prof": false,
  "constitution-save": 0,
  "constitution-save-prof": false,
  "intelligence-save": 0,
  "intelligence-save-prof": false,
  "wisdom-save": 0,
  "wisdom-save-prof": false,
  "charisma-save": 0,
  "charisma-save-prof": false,

  // Combat
  ac: 0,
  initiative: 0,
  speed: 0,
  maxhp: 0,
  currenthp: 0,
  temphp: 0,

  // Death Saves
  hitdice: "",
  "success-0": false,
  "success-1": false,
  "success-2": false,
  "failure-0": false,
  "failure-1": false,
  "failure-2": false,

  // Attacks
  attacks: [],
  "attack-notes": "",

  // Skills
  skills: [],

  // Proficiency + Inspiration
  inspiration: false,
  proficiencybonus: 0,

  // Spellcasting Core
  spellcastingClass: "",
  spellcastingAbility: "",
  spellSaveDC: 0,
  spellAttackBonus: 0,

  // Full Spellcasting Block
  spells: Array.from({ length: 10 }, (_, level) => ({
    level,
    slotsMax: level === 0 ? null : 0,
    slotsUsed: level === 0 ? null : 0,
    spells: Array.from({ length: 10 }, () => ({ name: "", desc: "" })),
  })),

  // Allies & Organizations
  allies: "",
  orgName: "",
  orgSymbolImage: "",

  // Equipment
  equipment: [],

  // Coins and Treasure
  coins: {
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 0,
    pp: 0,
  },
  treasure: [],

  // Personality
  personalityTraits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  features: "",
  additionalFeatures: "",

  // Wisdom block
  passiveWisdom: 0,
  otherProficiencies: "",

  // Metadata
  system: "",
  backstory: "",
  isPublic: false,
};

export default emptyCharacter;
