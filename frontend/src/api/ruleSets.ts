import type { FactionSummary, GeneralRuleResponse, RuleSetResponse, RuleSetSummary } from './types';

export interface CreateRuleSetRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateRuleSetRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface CreateGeneralRuleRequest {
  name: string;
  description: string;
}

export interface UpdateGeneralRuleRequest {
  name: string;
  description: string;
}

export interface CreateFactionRequest {
  name: string;
  description?: string;
}

export async function fetchRuleSets(): Promise<RuleSetSummary[]> {
  const res = await fetch('/api/rule-sets');
  if (!res.ok) throw new Error('Failed to fetch rule sets');
  return res.json();
}

export async function fetchRuleSet(id: string): Promise<RuleSetResponse> {
  const res = await fetch(`/api/rule-sets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch rule set');
  return res.json();
}

export async function createRuleSet(body: CreateRuleSetRequest): Promise<RuleSetSummary> {
  const res = await fetch('/api/rule-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create rule set');
  return res.json();
}

export async function updateRuleSet(
  id: string,
  body: UpdateRuleSetRequest,
): Promise<RuleSetSummary> {
  const res = await fetch(`/api/rule-sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update rule set');
  return res.json();
}

export async function createGeneralRule(
  ruleSetId: string,
  body: CreateGeneralRuleRequest,
): Promise<GeneralRuleResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/general-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create general rule');
  return res.json();
}

export async function updateGeneralRule(
  ruleSetId: string,
  ruleId: string,
  body: UpdateGeneralRuleRequest,
): Promise<GeneralRuleResponse> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/general-rules/${ruleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update general rule');
  return res.json();
}

export async function createFaction(
  ruleSetId: string,
  body: CreateFactionRequest,
): Promise<FactionSummary> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/factions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create faction');
  return res.json();
}

export async function deleteRuleSet(id: string): Promise<void> {
  const res = await fetch(`/api/rule-sets/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete rule set');
}

export async function deleteGeneralRule(ruleSetId: string, ruleId: string): Promise<void> {
  const res = await fetch(`/api/rule-sets/${ruleSetId}/general-rules/${ruleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete rule');
}
