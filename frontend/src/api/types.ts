export interface RuleSetSummary {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  ownerUsername: string | null;
  isOwner: boolean;
}

export interface SimpleRule {
  name: string;
  description: string;
}

export interface AbilitySummary {
  id: string;
  name: string;
  description: string;
}

export interface UnitTypeResponse {
  id: string;
  name: string;
  isStandard: boolean;
  statLine: string[];
  abilities: string[];
  rules: SimpleRule[];
}

export interface WeaponTypeResponse {
  id: string;
  name: string;
  isDeletable: boolean;
  statLine: string[];
  abilities: string[];
  rules: SimpleRule[];
}

export interface RuleSetResponse {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  ownerUsername: string | null;
  isOwner: boolean;
  generalRules: GeneralRuleResponse[];
  factions: FactionSummary[];
  abilities: AbilitySummary[];
  unitTypes: UnitTypeResponse[];
  weaponTypes: WeaponTypeResponse[];
}

export interface GeneralRuleResponse {
  id: string;
  name: string;
  description: string;
}

export interface FactionSummary {
  id: string;
  name: string;
  description: string | null;
}

export interface UnitSummary {
  id: string;
  name: string;
  pointsCost: number;
  unitTypeName: string | null;
  weaponSets: WeaponSetResponse[];
  stats: Record<string, string>;
  abilities: string[];
}

export interface WeaponResponse {
  id: string;
  name: string;
  pointsCost: number;
  weaponTypeName: string | null;
  stats: Record<string, string>;
  abilities: string[];
  rules: SimpleRule[];
}

export interface WeaponSetEntryResponse {
  entryId: string;
  weaponId: string;
  name: string;
  pointsCost: number;
  weaponTypeName: string | null;
}

export interface WeaponSetResponse {
  id: string;
  name: string;
  isDefault: boolean;
  overriddenPointsCost: number | null;
  effectivePointsCost: number;
  entries: WeaponSetEntryResponse[];
}

export interface FactionResponse {
  id: string;
  name: string;
  description: string | null;
  factionRules: FactionRuleResponse[];
  units: UnitSummary[];
  weapons: WeaponResponse[];
}

export interface FactionRuleResponse {
  id: string;
  name: string;
  description: string;
}
