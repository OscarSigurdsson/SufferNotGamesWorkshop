export interface RosterEntry {
  unitId: string;
  name: string;
  pointsCost: number;
  quantity: number;
}

export interface ArmyList {
  schemaVersion: 1;
  name: string;
  exportedAt: string;
  ruleSet: { id: string; name: string };
  faction: { id: string; name: string };
  pointsBudget: number;
  totalPoints: number;
  roster: RosterEntry[];
}

const IMPORT_MARKER = '--- IMPORT DATA (do not edit below this line) ---';

function formatPretty(list: ArmyList): string {
  const HR = '='.repeat(52);
  const DIV = '-'.repeat(52);
  const date = list.exportedAt.slice(0, 10);
  const over = list.totalPoints - list.pointsBudget;

  // Dynamic column widths
  const nameCol = Math.max(20, ...list.roster.map((r) => r.name.length)) + 4;
  const qtyCol = Math.max(...list.roster.map((r) => `${r.quantity} x ${r.pointsCost} pts`.length)) + 3;

  function rosterRow(entry: RosterEntry): string {
    const name = entry.name.padEnd(nameCol);
    const mid = `${entry.quantity} x ${entry.pointsCost} pts`.padEnd(qtyCol);
    const total = `${entry.quantity * entry.pointsCost} pts`.padStart(8);
    return `  ${name}${mid}${total}`;
  }

  const lines: string[] = [
    HR,
    '  SUFFERNOT WORKSHOP — ARMY LIST',
    HR,
    '',
    `  Army:     ${list.name}`,
    `  Rule Set: ${list.ruleSet.name}`,
    `  Faction:  ${list.faction.name}`,
    `  Exported: ${date}`,
    '',
    `  Points:   ${list.totalPoints} / ${list.pointsBudget} pts`,
    ...(over > 0 ? [`  *** OVER BUDGET by ${over} pts ***`] : []),
    '',
    DIV,
    '  ROSTER',
    DIV,
    '',
    ...list.roster.map(rosterRow),
    '',
    DIV,
    `  ${'Total'.padEnd(nameCol + qtyCol)}${String(list.totalPoints).padStart(5)} pts`,
    `  ${'Budget'.padEnd(nameCol + qtyCol)}${String(list.pointsBudget).padStart(5)} pts`,
    DIV,
    '',
    '',
    IMPORT_MARKER,
    JSON.stringify(list),
  ];

  return lines.join('\n');
}

export function exportArmy(army: Omit<ArmyList, 'schemaVersion' | 'exportedAt'>): void {
  const list: ArmyList = { schemaVersion: 1, exportedAt: new Date().toISOString(), ...army };
  const blob = new Blob([formatPretty(list)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${army.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'army'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseArmyData(raw: string): ArmyList {
  const data = JSON.parse(raw) as ArmyList;
  if (data.schemaVersion !== 1) throw new Error('Unrecognised file format');
  if (!data.ruleSet?.id || !data.faction?.id || !Array.isArray(data.roster))
    throw new Error('Invalid army file');
  return data;
}

export function importArmy(file: File): Promise<ArmyList> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string).trim();
        // Pretty-print format: JSON is embedded after the marker
        const markerIdx = text.indexOf(IMPORT_MARKER);
        if (markerIdx !== -1) {
          resolve(parseArmyData(text.slice(markerIdx + IMPORT_MARKER.length).trim()));
          return;
        }
        // Fall back to plain JSON
        resolve(parseArmyData(text));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not parse file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}
