import type { WeaponResponse, WeaponSetResponse, SimpleRule } from './types';

export interface CreateWeaponRequest {
  name: string;
  weaponTypeId: string | null;
  pointsCost: number;
  stats: Record<string, string>;
  abilities: string[];
  rules: SimpleRule[];
}

export interface UpdateWeaponRequest {
  name: string;
  weaponTypeId: string | null;
  pointsCost: number;
  stats: Record<string, string>;
  abilities: string[];
  rules: SimpleRule[];
}

export async function createWeapon(
  ruleSetId: string,
  factionId: string,
  body: CreateWeaponRequest,
): Promise<WeaponResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}/weapons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create weapon');
  return res.json();
}

export async function updateWeapon(
  ruleSetId: string,
  factionId: string,
  weaponId: string,
  body: UpdateWeaponRequest,
): Promise<WeaponResponse> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/weapons/${weaponId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error('Failed to update weapon');
  return res.json();
}

export async function deleteWeapon(
  ruleSetId: string,
  factionId: string,
  weaponId: string,
): Promise<void> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/weapons/${weaponId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('Failed to delete weapon');
}

export async function fetchWeaponSets(
  ruleSetId: string,
  factionId: string,
  unitId: string,
): Promise<WeaponSetResponse[]> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}/weapon-sets`,
  );
  if (!res.ok) throw new Error('Failed to fetch weapon sets');
  return res.json();
}

export async function createWeaponSet(
  ruleSetId: string,
  factionId: string,
  unitId: string,
  body: { name: string; isDefault: boolean },
): Promise<WeaponSetResponse> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}/weapon-sets`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error('Failed to create weapon set');
  return res.json();
}

export async function updateWeaponSet(
  ruleSetId: string,
  factionId: string,
  unitId: string,
  setId: string,
  body: { name?: string; isDefault?: boolean; overriddenPointsCost?: number; clearOverride?: boolean },
): Promise<WeaponSetResponse> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}/weapon-sets/${setId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error('Failed to update weapon set');
  return res.json();
}

export async function deleteWeaponSet(
  ruleSetId: string,
  factionId: string,
  unitId: string,
  setId: string,
): Promise<void> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}/weapon-sets/${setId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('Failed to delete weapon set');
}

export async function addWeaponToSet(
  ruleSetId: string,
  factionId: string,
  unitId: string,
  setId: string,
  weaponId: string,
): Promise<WeaponSetResponse> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}/weapon-sets/${setId}/weapons/${weaponId}`,
    { method: 'POST' },
  );
  if (!res.ok) throw new Error('Failed to add weapon to set');
  return res.json();
}

export async function removeEntryFromSet(
  ruleSetId: string,
  factionId: string,
  unitId: string,
  setId: string,
  entryId: string,
): Promise<WeaponSetResponse> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}/weapon-sets/${setId}/entries/${entryId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('Failed to remove entry from set');
  return res.json();
}
