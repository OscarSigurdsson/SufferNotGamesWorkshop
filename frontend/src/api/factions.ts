import type { FactionResponse, FactionRuleResponse, UnitSummary } from './types';

export interface CreateFactionRuleRequest {
  name: string;
  description: string;
}

export interface UpdateFactionRuleRequest {
  name: string;
  description: string;
}

export interface UpdateFactionRequest {
  name: string;
  description?: string;
}

export interface CreateUnitRequest {
  name: string;
  pointsCost: number;
  unitTypeId?: string | null;
  stats?: Record<string, string>;
  abilities?: string[];
}

export interface UpdateUnitRequest {
  name: string;
  pointsCost: number;
  unitTypeId?: string | null;
  stats?: Record<string, string>;
  abilities?: string[];
}

export async function fetchFaction(ruleSetId: string, factionId: string): Promise<FactionResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}`);
  if (!res.ok) throw new Error('Failed to fetch faction');
  return res.json();
}

export async function updateFaction(
  ruleSetId: string,
  factionId: string,
  body: UpdateFactionRequest,
): Promise<FactionResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update faction');
  return res.json();
}

export async function createFactionRule(
  ruleSetId: string,
  factionId: string,
  body: CreateFactionRuleRequest,
): Promise<FactionRuleResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}/faction-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create faction rule');
  return res.json();
}

export async function updateFactionRule(
  ruleSetId: string,
  factionId: string,
  ruleId: string,
  body: UpdateFactionRuleRequest,
): Promise<FactionRuleResponse> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/faction-rules/${ruleId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error('Failed to update faction rule');
  return res.json();
}

export async function createUnit(
  ruleSetId: string,
  factionId: string,
  body: CreateUnitRequest,
): Promise<UnitSummary> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create unit');
  return res.json();
}

export async function updateUnit(
  ruleSetId: string,
  factionId: string,
  unitId: string,
  body: UpdateUnitRequest,
): Promise<UnitSummary> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update unit');
  return res.json();
}

export async function deleteFaction(ruleSetId: string, factionId: string): Promise<void> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete faction');
}

export async function deleteFactionRule(
  ruleSetId: string,
  factionId: string,
  ruleId: string,
): Promise<void> {
  const res = await fetch(
    `/api/rule-sets/${ruleSetId}/factions/${factionId}/faction-rules/${ruleId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('Failed to delete faction rule');
}

export async function deleteUnit(
  ruleSetId: string,
  factionId: string,
  unitId: string,
): Promise<void> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions/${factionId}/units/${unitId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete unit');
}
