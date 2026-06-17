export interface UnitStats {
  movement: string;
  toughness: number;
  save: string;
  wounds: number;
  leadership: string;
  objectiveControl: number;
}

export interface WeaponProfile {
  name: string;
  range: string;
  attacks: string;
  skill: string;
  strength: number;
  armorPenetration: number;
  damage: string;
  abilities: string[];
}

export interface Ability {
  name: string;
  description: string;
  isCore?: boolean;
}

export interface UnitDatasheet {
  name: string;
  faction: string;
  factionKeywords: string[];
  keywords: string[];
  stats: UnitStats;
  rangedWeapons: WeaponProfile[];
  meleeWeapons: WeaponProfile[];
  abilities: Ability[];
  pointsCost: number;
  modelCount: string;
}
