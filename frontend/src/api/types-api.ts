import type { AbilitySummary, SimpleRule, UnitTypeResponse, WeaponTypeResponse } from './types';

export interface TypeRuleRequest {
  name: string;
  description: string;
}

export interface CreateUnitTypeRequest {
  name: string;
  statLine: string[];
  abilities: string[];
  rules: TypeRuleRequest[];
}

export interface CreateWeaponTypeRequest {
  name: string;
  statLine: string[];
  abilities: string[];
  rules: TypeRuleRequest[];
}

export async function addAbility(
  ruleSetId: string,
  name: string,
  description: string,
): Promise<AbilitySummary> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/abilities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to add ability');
  return res.json();
}

export async function updateAbility(
  ruleSetId: string,
  abilityId: string,
  name: string,
  description: string,
): Promise<AbilitySummary> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/abilities/${abilityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to update ability');
  return res.json();
}

export async function deleteAbility(ruleSetId: string, abilityId: string): Promise<void> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/abilities/${abilityId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete ability');
}

export async function fetchWeaponTypes(ruleSetId: string): Promise<WeaponTypeResponse[]> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/weapon-types`);
  if (!res.ok) throw new Error('Failed to fetch weapon types');
  return res.json();
}

export async function fetchUnitTypes(ruleSetId: string): Promise<UnitTypeResponse[]> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/unit-types`);
  if (!res.ok) throw new Error('Failed to fetch unit types');
  return res.json();
}

export async function createUnitType(
  ruleSetId: string,
  body: CreateUnitTypeRequest,
): Promise<UnitTypeResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/unit-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create unit type');
  return res.json();
}

export async function updateUnitType(
  ruleSetId: string,
  typeId: string,
  body: CreateUnitTypeRequest,
): Promise<UnitTypeResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/unit-types/${typeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to update unit type');
  }
  return res.json();
}

export async function deleteUnitType(ruleSetId: string, typeId: string): Promise<void> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/unit-types/${typeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to delete unit type');
  }
}

export async function createWeaponType(
  ruleSetId: string,
  body: CreateWeaponTypeRequest,
): Promise<WeaponTypeResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/weapon-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create weapon type');
  return res.json();
}

export async function updateWeaponType(
  ruleSetId: string,
  typeId: string,
  body: CreateWeaponTypeRequest,
): Promise<WeaponTypeResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/weapon-types/${typeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to update weapon type');
  }
  return res.json();
}

export async function deleteWeaponType(ruleSetId: string, typeId: string): Promise<void> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/weapon-types/${typeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to delete weapon type');
  }
}

// Re-export SimpleRule for convenience
export type { SimpleRule };
