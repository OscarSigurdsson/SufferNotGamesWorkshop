import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRuleSets, fetchRuleSet } from '../../api/ruleSets';
import { fetchFaction } from '../../api/factions';
import type { RuleSetSummary, FactionSummary, UnitSummary } from '../../api/types';
import { exportArmy, importArmy } from '../../api/army-export';
import './ArmyBuilding.css';

// ── types ─────────────────────────────────────────────────────────────────────

type BuilderConfig = {
  ruleSetId: string;
  ruleSetName: string;
  factionId: string;
  factionName: string;
  armyName: string;
  pointsBudget: number;
  importedRoster?: Array<{ unitId: string; quantity: number }>;
};

type Step =
  | { kind: 'pick-ruleset' }
  | { kind: 'pick-faction'; ruleSetId: string; ruleSetName: string }
  | { kind: 'setup'; ruleSetId: string; ruleSetName: string; factionId: string; factionName: string }
  | { kind: 'builder'; config: BuilderConfig };

// ── root ──────────────────────────────────────────────────────────────────────

export function ArmyBuilding() {
  const [step, setStep] = useState<Step>({ kind: 'pick-ruleset' });
  const importRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleImport(file: File) {
    setImportError(null);
    try {
      const army = await importArmy(file);
      setStep({
        kind: 'builder',
        config: {
          ruleSetId: army.ruleSet.id,
          ruleSetName: army.ruleSet.name,
          factionId: army.faction.id,
          factionName: army.faction.name,
          armyName: army.name,
          pointsBudget: army.pointsBudget,
          importedRoster: army.roster.map((r) => ({ unitId: r.unitId, quantity: r.quantity })),
        },
      });
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed');
    }
  }

  return (
    <div>
      <div className="ab-toolbar">
        <button className="rw-btn rw-btn-secondary" onClick={() => importRef.current?.click()}>
          Import Army
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".txt,.json,text/plain,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = '';
          }}
        />
        {importError && <span className="rw-error">{importError}</span>}
      </div>

      {step.kind === 'pick-ruleset' && (
        <RuleSetPicker
          onSelect={(id, name) => setStep({ kind: 'pick-faction', ruleSetId: id, ruleSetName: name })}
        />
      )}
      {step.kind === 'pick-faction' && (
        <FactionPicker
          ruleSetId={step.ruleSetId}
          ruleSetName={step.ruleSetName}
          onBack={() => setStep({ kind: 'pick-ruleset' })}
          onSelect={(factionId, factionName) =>
            setStep({
              kind: 'setup',
              ruleSetId: step.ruleSetId,
              ruleSetName: step.ruleSetName,
              factionId,
              factionName,
            })
          }
        />
      )}
      {step.kind === 'setup' && (
        <BudgetSetup
          ruleSetName={step.ruleSetName}
          factionName={step.factionName}
          onBack={() =>
            setStep({ kind: 'pick-faction', ruleSetId: step.ruleSetId, ruleSetName: step.ruleSetName })
          }
          onBegin={(armyName, pointsBudget) =>
            setStep({
              kind: 'builder',
              config: {
                ruleSetId: step.ruleSetId,
                ruleSetName: step.ruleSetName,
                factionId: step.factionId,
                factionName: step.factionName,
                armyName,
                pointsBudget,
              },
            })
          }
        />
      )}
      {step.kind === 'builder' && (
        <ArmyBuilder
          key={`${step.config.ruleSetId}-${step.config.factionId}-${step.config.armyName}`}
          config={step.config}
          onReset={() => setStep({ kind: 'pick-ruleset' })}
        />
      )}
    </div>
  );
}

// ── Step 1: pick rule set ─────────────────────────────────────────────────────

function RuleSetPicker({ onSelect }: { onSelect: (id: string, name: string) => void }) {
  const { data: ruleSets, isLoading, error } = useQuery({
    queryKey: ['ruleSets'],
    queryFn: fetchRuleSets,
  });

  if (isLoading) return <p className="rw-loading">Loading rule sets…</p>;
  if (error) return <p className="rw-error">Failed to load rule sets.</p>;

  return (
    <div className="rw-panel">
      <div className="rw-panel-header">
        <h2 className="rw-panel-title">Select Rule Set</h2>
      </div>
      {ruleSets?.length === 0 && (
        <p className="rw-empty">No rule sets found. Create one in Rules Writing first.</p>
      )}
      <ul className="rw-list">
        {ruleSets?.map((rs: RuleSetSummary) => (
          <li key={rs.id} className="rw-list-item" onClick={() => onSelect(rs.id, rs.name)}>
            <span className="rw-list-item-name">{rs.name}</span>
            {rs.description && <span className="rw-list-item-desc">{rs.description}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Step 2: pick faction ──────────────────────────────────────────────────────

function FactionPicker({
  ruleSetId,
  ruleSetName,
  onBack,
  onSelect,
}: {
  ruleSetId: string;
  ruleSetName: string;
  onBack: () => void;
  onSelect: (factionId: string, factionName: string) => void;
}) {
  const { data: ruleSet, isLoading, error } = useQuery({
    queryKey: ['ruleSet', ruleSetId],
    queryFn: () => fetchRuleSet(ruleSetId),
  });

  if (isLoading) return <p className="rw-loading">Loading factions…</p>;
  if (error || !ruleSet) return <p className="rw-error">Failed to load rule set.</p>;

  return (
    <div className="rw-panel">
      <div className="rw-breadcrumb">
        <button className="rw-back" onClick={onBack}>
          ← Rule Sets
        </button>
      </div>
      <h2 className="rw-panel-title">{ruleSetName}</h2>
      <h3 className="rw-section-title ab-step-heading">Select Faction</h3>
      {ruleSet.factions.length === 0 && (
        <p className="rw-empty">No factions in this rule set yet.</p>
      )}
      <ul className="rw-list">
        {ruleSet.factions.map((f: FactionSummary) => (
          <li key={f.id} className="rw-list-item" onClick={() => onSelect(f.id, f.name)}>
            <span className="rw-list-item-name">{f.name}</span>
            {f.description && <span className="rw-list-item-desc">{f.description}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Step 3: name + budget ─────────────────────────────────────────────────────

function BudgetSetup({
  ruleSetName,
  factionName,
  onBack,
  onBegin,
}: {
  ruleSetName: string;
  factionName: string;
  onBack: () => void;
  onBegin: (armyName: string, pointsBudget: number) => void;
}) {
  const [armyName, setArmyName] = useState('');
  const [budget, setBudget] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pts = parseInt(budget);
    if (!armyName.trim() || !pts || pts < 1) return;
    onBegin(armyName.trim(), pts);
  }

  return (
    <div className="rw-panel">
      <div className="rw-breadcrumb">
        <button className="rw-back" onClick={onBack}>
          ← {ruleSetName}
        </button>
      </div>
      <h2 className="rw-panel-title">{factionName}</h2>
      <form className="rw-form" onSubmit={handleSubmit}>
        <label className="rw-label">
          Army Name
          <input
            className="rw-input"
            value={armyName}
            onChange={(e) => setArmyName(e.target.value)}
            placeholder="e.g. My Crusade Force"
            autoFocus
          />
        </label>
        <label className="rw-label">
          Point Budget
          <input
            className="rw-input rw-input-narrow"
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 2000"
          />
        </label>
        <button className="rw-btn rw-btn-primary" type="submit">
          Begin Building
        </button>
      </form>
    </div>
  );
}

// ── Step 4: army builder ──────────────────────────────────────────────────────

function ArmyBuilder({
  config,
  onReset,
}: {
  config: BuilderConfig;
  onReset: () => void;
}) {
  const { data: faction, isLoading, error } = useQuery({
    queryKey: ['faction', config.ruleSetId, config.factionId],
    queryFn: () => fetchFaction(config.ruleSetId, config.factionId),
  });

  const [roster, setRoster] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    config.importedRoster?.forEach(({ unitId, quantity }) => {
      init[unitId] = quantity;
    });
    return init;
  });

  const [selectedSets, setSelectedSets] = useState<Record<string, string>>({});

  const units: UnitSummary[] = faction?.units ?? [];

  function resolvedSetId(unit: UnitSummary): string | undefined {
    return selectedSets[unit.id] ?? (unit.weaponSets.find((s) => s.isDefault) ?? unit.weaponSets[0])?.id;
  }

  function effectiveCost(unit: UnitSummary): number {
    if (unit.weaponSets.length === 0) return unit.pointsCost;
    const set = unit.weaponSets.find((s) => s.id === resolvedSetId(unit));
    return unit.pointsCost + (set?.effectivePointsCost ?? 0);
  }

  const totalPoints = units.reduce((sum, u) => sum + effectiveCost(u) * (roster[u.id] ?? 0), 0);
  const isOverBudget = totalPoints > config.pointsBudget;
  const budgetPct = Math.min((totalPoints / config.pointsBudget) * 100, 100);

  function add(unitId: string) {
    setRoster((r) => ({ ...r, [unitId]: (r[unitId] ?? 0) + 1 }));
  }

  function remove(unitId: string) {
    setRoster((r) => {
      const next = { ...r, [unitId]: (r[unitId] ?? 1) - 1 };
      if (next[unitId] <= 0) delete next[unitId];
      return next;
    });
  }

  function selectSet(unitId: string, setId: string) {
    setSelectedSets((prev) => ({ ...prev, [unitId]: setId }));
  }

  function handleExport() {
    exportArmy({
      name: config.armyName,
      ruleSet: { id: config.ruleSetId, name: config.ruleSetName },
      faction: { id: config.factionId, name: config.factionName },
      pointsBudget: config.pointsBudget,
      totalPoints,
      roster: units
        .filter((u) => (roster[u.id] ?? 0) > 0)
        .map((u) => ({
          unitId: u.id,
          name: u.name,
          pointsCost: effectiveCost(u),
          quantity: roster[u.id],
        })),
    });
  }

  if (isLoading) return <p className="rw-loading">Loading units…</p>;
  if (error || !faction) return <p className="rw-error">Failed to load faction data.</p>;

  const rosterUnits = units.filter((u) => (roster[u.id] ?? 0) > 0);

  return (
    <div className="ab-builder">
      <div className="ab-builder-header">
        <div>
          <button className="rw-back" onClick={onReset}>
            ← New Army
          </button>
          <h2 className="rw-panel-title ab-army-title">{config.armyName}</h2>
          <p className="ab-army-meta">
            {config.ruleSetName} — {config.factionName}
          </p>
        </div>
        <button className="rw-btn rw-btn-primary" onClick={handleExport}>
          Export Army
        </button>
      </div>

      <div className={`ab-budget${isOverBudget ? ' ab-budget--over' : ''}`}>
        <div className="ab-budget-label">
          <span>
            {totalPoints} / {config.pointsBudget} pts
          </span>
          {isOverBudget && (
            <span className="ab-budget-warning">
              Over budget by {totalPoints - config.pointsBudget} pts
            </span>
          )}
        </div>
        <div className="ab-budget-track">
          <div className="ab-budget-fill" style={{ width: `${budgetPct}%` }} />
        </div>
      </div>

      <div className="ab-columns">
        <div className="ab-col">
          <h3 className="rw-section-title ab-col-title">Available Units</h3>
          {units.length === 0 && <p className="rw-empty">No units in this faction yet.</p>}
          <ul className="rw-list">
            {units.map((u) => (
              <li key={u.id} className="rw-list-item rw-list-item--static ab-unit-row">
                <div className="ab-unit-info">
                  <span className="rw-list-item-name">{u.name}</span>
                  {u.weaponSets.length > 0 && (
                    <select
                      className="ab-set-select"
                      value={resolvedSetId(u) ?? ''}
                      onChange={(e) => selectSet(u.id, e.target.value)}
                    >
                      {u.weaponSets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.effectivePointsCost} pts)
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="rw-list-item-pts">{effectiveCost(u)} pts</span>
                </div>
                <button className="rw-btn rw-btn-secondary ab-add-btn" onClick={() => add(u.id)}>
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ab-col">
          <h3 className="rw-section-title ab-col-title">Your Roster</h3>
          {rosterUnits.length === 0 && <p className="rw-empty">No units added yet.</p>}
          <ul className="rw-list">
            {rosterUnits.map((u) => {
              const qty = roster[u.id];
              const cost = effectiveCost(u);
              return (
                <li key={u.id} className="rw-list-item rw-list-item--static ab-roster-row">
                  <div className="ab-unit-info">
                    <span className="rw-list-item-name">{u.name}</span>
                    {u.weaponSets.length > 0 && (
                      <select
                        className="ab-set-select"
                        value={resolvedSetId(u) ?? ''}
                        onChange={(e) => selectSet(u.id, e.target.value)}
                      >
                        {u.weaponSets.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.effectivePointsCost} pts)
                          </option>
                        ))}
                      </select>
                    )}
                    <span className="rw-list-item-pts">
                      {qty} × {cost} = {qty * cost} pts
                    </span>
                  </div>
                  <div className="ab-qty-controls">
                    <button className="rw-btn rw-btn-secondary ab-qty-btn" onClick={() => remove(u.id)}>
                      −
                    </button>
                    <span className="ab-qty-value">{qty}</span>
                    <button className="rw-btn rw-btn-secondary ab-qty-btn" onClick={() => add(u.id)}>
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
