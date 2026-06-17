import { describe, it, expect } from 'vitest';
import { importArmy } from './army-export';

const MARKER = '--- IMPORT DATA (do not edit below this line) ---';

function makeFile(content: string, name = 'army.json') {
  return new File([content], name, { type: 'application/json' });
}

const validArmy = {
  schemaVersion: 1 as const,
  name: 'Test Army',
  exportedAt: '2026-01-01T00:00:00.000Z',
  ruleSet: { id: 'rs1', name: 'Core Rules' },
  faction: { id: 'f1', name: 'Blood Ravens' },
  pointsBudget: 500,
  totalPoints: 150,
  roster: [{ unitId: 'u1', name: 'Intercessors', pointsCost: 150, quantity: 1 }],
};

describe('importArmy', () => {
  it('parses a plain JSON export', async () => {
    const result = await importArmy(makeFile(JSON.stringify(validArmy)));
    expect(result.name).toBe('Test Army');
    expect(result.roster).toHaveLength(1);
    expect(result.pointsBudget).toBe(500);
  });

  it('extracts JSON from a pretty-printed text export', async () => {
    const text = `Pretty header\n\n${MARKER}\n${JSON.stringify(validArmy)}`;
    const result = await importArmy(makeFile(text, 'army.txt'));
    expect(result.name).toBe('Test Army');
    expect(result.faction.name).toBe('Blood Ravens');
  });

  it('rejects malformed JSON', async () => {
    await expect(importArmy(makeFile('not json'))).rejects.toThrow();
  });

  it('rejects wrong schema version', async () => {
    const bad = JSON.stringify({ ...validArmy, schemaVersion: 2 });
    await expect(importArmy(makeFile(bad))).rejects.toThrow('Unrecognised file format');
  });

  it('rejects a file missing required fields', async () => {
    const bad = JSON.stringify({ schemaVersion: 1, name: 'Oops' });
    await expect(importArmy(makeFile(bad))).rejects.toThrow('Invalid army file');
  });
});
