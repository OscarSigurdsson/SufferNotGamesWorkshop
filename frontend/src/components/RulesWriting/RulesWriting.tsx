import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRuleSets,
  fetchRuleSet,
  createRuleSet,
  updateRuleSet,
  createGeneralRule,
  updateGeneralRule,
  createFaction,
  deleteRuleSet,
  deleteGeneralRule,
} from '../../api/ruleSets';
import {
  fetchFaction,
  updateFaction,
  createFactionRule,
  updateFactionRule,
  createUnit,
  updateUnit,
  deleteFaction,
  deleteFactionRule,
  deleteUnit,
} from '../../api/factions';
import {
  addAbility,
  updateAbility,
  deleteAbility,
  fetchWeaponTypes,
  fetchUnitTypes,
  createUnitType,
  updateUnitType,
  deleteUnitType,
  createWeaponType,
  updateWeaponType,
  deleteWeaponType,
} from '../../api/types-api';
import {
  createWeapon,
  updateWeapon,
  deleteWeapon,
  fetchWeaponSets,
  createWeaponSet,
  updateWeaponSet,
  deleteWeaponSet,
  addWeaponToSet,
  removeEntryFromSet,
} from '../../api/weapons';
import type {
  RuleSetSummary,
  FactionSummary,
  UnitTypeResponse,
  WeaponTypeResponse,
  AbilitySummary,
  WeaponResponse,
  WeaponSetResponse,
  WeaponSetEntryResponse,
  UnitSummary,
  SimpleRule,
} from '../../api/types';
import './RulesWriting.css';

type View =
  | { kind: 'ruleset-list' }
  | { kind: 'ruleset-detail'; ruleSetId: string }
  | { kind: 'faction-detail'; ruleSetId: string; factionId: string; isOwner: boolean }
  | {
      kind: 'unit-detail';
      ruleSetId: string;
      factionId: string;
      unitId: string;
      unitName: string;
      isOwner: boolean;
    };

export function RulesWriting() {
  const [view, setView] = useState<View>({ kind: 'ruleset-list' });

  if (view.kind === 'ruleset-list') {
    return <RuleSetList onSelect={(id) => setView({ kind: 'ruleset-detail', ruleSetId: id })} />;
  }
  if (view.kind === 'ruleset-detail') {
    return (
      <RuleSetDetail
        ruleSetId={view.ruleSetId}
        onBack={() => setView({ kind: 'ruleset-list' })}
        onSelectFaction={(factionId, isOwner) =>
          setView({ kind: 'faction-detail', ruleSetId: view.ruleSetId, factionId, isOwner })
        }
      />
    );
  }
  if (view.kind === 'faction-detail') {
    return (
      <FactionDetail
        ruleSetId={view.ruleSetId}
        factionId={view.factionId}
        isOwner={view.isOwner}
        onBack={() => setView({ kind: 'ruleset-detail', ruleSetId: view.ruleSetId })}
        onSelectUnit={(unitId, unitName) =>
          setView({
            kind: 'unit-detail',
            ruleSetId: view.ruleSetId,
            factionId: view.factionId,
            unitId,
            unitName,
            isOwner: view.isOwner,
          })
        }
      />
    );
  }
  return (
    <UnitDetail
      ruleSetId={view.ruleSetId}
      factionId={view.factionId}
      unitId={view.unitId}
      unitName={view.unitName}
      isOwner={view.isOwner}
      onBack={() =>
        setView({
          kind: 'faction-detail',
          ruleSetId: view.ruleSetId,
          factionId: view.factionId,
          isOwner: view.isOwner,
        })
      }
    />
  );
}

// ── RuleSet list ──────────────────────────────────────────────────────────────

function RuleSetList({ onSelect }: { onSelect: (id: string) => void }) {
  const queryClient = useQueryClient();
  const { data: ruleSets, isLoading, error } = useQuery({
    queryKey: ['ruleSets'],
    queryFn: fetchRuleSets,
  });
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const mutation = useMutation({
    mutationFn: createRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ruleSets'] });
      setShowForm(false);
      setName('');
      setDescription('');
      setIsPublic(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRuleSet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ruleSets'] }),
  });

  function handleDelete(e: React.MouseEvent, id: string, n: string) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${n}" and all its contents? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  }

  if (isLoading) return <p className="rw-loading">Loading rule sets…</p>;
  if (error) return <p className="rw-error">Failed to load rule sets.</p>;

  const myRuleSets = ruleSets?.filter((r) => r.isOwner) ?? [];
  const publicRuleSets = ruleSets?.filter((r) => !r.isOwner) ?? [];

  return (
    <div className="rw-panel">
      <div className="rw-panel-header">
        <h2 className="rw-panel-title">Rule Sets</h2>
        <button className="rw-btn rw-btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Rule Set'}
        </button>
      </div>

      {showForm && (
        <form
          className="rw-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            mutation.mutate({ name: name.trim(), description: description.trim() || undefined, isPublic });
          }}
        >
          <label className="rw-label">
            Name
            <input className="rw-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="rw-label">
            Description
            <input className="rw-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </label>
          <label className="rw-label rw-label--row">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Public (visible to other players)
          </label>
          <button className="rw-btn rw-btn-primary" type="submit" disabled={mutation.isPending}>Create</button>
          {mutation.isError && <p className="rw-error">Failed to create rule set.</p>}
        </form>
      )}

      {myRuleSets.length > 0 && (
        <section className="rw-section">
          <div className="rw-section-header"><h3 className="rw-section-title">My Rule Sets</h3></div>
          <ul className="rw-list">
            {myRuleSets.map((rs: RuleSetSummary) => (
              <li key={rs.id} className="rw-list-item" onClick={() => onSelect(rs.id)}>
                <div className="rw-list-item-row">
                  <span className="rw-list-item-name">{rs.name}</span>
                  <div className="rw-list-item-actions">
                    <span className={`rw-visibility-badge ${rs.isPublic ? 'rw-visibility-badge--public' : 'rw-visibility-badge--private'}`}>
                      {rs.isPublic ? 'Public' : 'Private'}
                    </span>
                    <button className="rw-btn-icon rw-btn-danger" title="Delete rule set"
                      onClick={(e) => handleDelete(e, rs.id, rs.name)}>×</button>
                  </div>
                </div>
                {rs.description && <span className="rw-list-item-desc">{rs.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {publicRuleSets.length > 0 && (
        <section className="rw-section">
          <div className="rw-section-header"><h3 className="rw-section-title">Community Rule Sets</h3></div>
          <ul className="rw-list">
            {publicRuleSets.map((rs: RuleSetSummary) => (
              <li key={rs.id} className="rw-list-item" onClick={() => onSelect(rs.id)}>
                <div className="rw-list-item-row">
                  <span className="rw-list-item-name">{rs.name}</span>
                  <span className="rw-list-item-owner">by {rs.ownerUsername ?? 'unknown'}</span>
                </div>
                {rs.description && <span className="rw-list-item-desc">{rs.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(!ruleSets || ruleSets.length === 0) && !showForm && (
        <p className="rw-empty">No rule sets yet. Create one to get started.</p>
      )}
    </div>
  );
}

// ── RuleSet detail ────────────────────────────────────────────────────────────

function RuleSetDetail({
  ruleSetId,
  onBack,
  onSelectFaction,
}: {
  ruleSetId: string;
  onBack: () => void;
  onSelectFaction: (factionId: string, isOwner: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { data: ruleSet, isLoading, error } = useQuery({
    queryKey: ['ruleSet', ruleSetId],
    queryFn: () => fetchRuleSet(ruleSetId),
  });

  const [editingRuleSet, setEditingRuleSet] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPublic, setEditPublic] = useState(true);

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [editRuleName, setEditRuleName] = useState('');
  const [editRuleDesc, setEditRuleDesc] = useState('');

  const [showFactionForm, setShowFactionForm] = useState(false);
  const [factionName, setFactionName] = useState('');
  const [factionDesc, setFactionDesc] = useState('');

  const [newAbilityName, setNewAbilityName] = useState('');
  const [newAbilityDesc, setNewAbilityDesc] = useState('');
  const [editAbilityId, setEditAbilityId] = useState<string | null>(null);
  const [editAbilityName, setEditAbilityName] = useState('');
  const [editAbilityDesc, setEditAbilityDesc] = useState('');

  const [showUnitTypeForm, setShowUnitTypeForm] = useState(false);
  const [showWeaponTypeForm, setShowWeaponTypeForm] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ruleSet', ruleSetId] });

  const updateRuleSetMutation = useMutation({
    mutationFn: (req: Parameters<typeof updateRuleSet>[1]) => updateRuleSet(ruleSetId, req),
    onSuccess: () => { invalidate(); setEditingRuleSet(false); },
  });

  const addRuleMutation = useMutation({
    mutationFn: (req: { name: string; description: string }) => createGeneralRule(ruleSetId, req),
    onSuccess: () => { invalidate(); setShowRuleForm(false); setRuleName(''); setRuleDesc(''); },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, req }: { id: string; req: { name: string; description: string } }) =>
      updateGeneralRule(ruleSetId, id, req),
    onSuccess: () => { invalidate(); setEditRuleId(null); },
  });

  const deleteRuleSetMutation = useMutation({ mutationFn: () => deleteRuleSet(ruleSetId), onSuccess: onBack });

  const deleteGeneralRuleMutation = useMutation({
    mutationFn: (ruleId: string) => deleteGeneralRule(ruleSetId, ruleId),
    onSuccess: invalidate,
  });

  const deleteFactionMutation = useMutation({
    mutationFn: (factionId: string) => deleteFaction(ruleSetId, factionId),
    onSuccess: invalidate,
  });

  const addFactionMutation = useMutation({
    mutationFn: (req: { name: string; description?: string }) => createFaction(ruleSetId, req),
    onSuccess: () => { invalidate(); setShowFactionForm(false); setFactionName(''); setFactionDesc(''); },
  });

  const addAbilityMutation = useMutation({
    mutationFn: ({ name, desc }: { name: string; desc: string }) => addAbility(ruleSetId, name, desc),
    onSuccess: () => { invalidate(); setNewAbilityName(''); setNewAbilityDesc(''); },
  });

  const updateAbilityMutation = useMutation({
    mutationFn: ({ id, name, desc }: { id: string; name: string; desc: string }) =>
      updateAbility(ruleSetId, id, name, desc),
    onSuccess: () => { invalidate(); setEditAbilityId(null); },
  });

  const deleteAbilityMutation = useMutation({
    mutationFn: (abilityId: string) => deleteAbility(ruleSetId, abilityId),
    onSuccess: invalidate,
  });

  const deleteUnitTypeMutation = useMutation({
    mutationFn: (typeId: string) => deleteUnitType(ruleSetId, typeId),
    onSuccess: invalidate,
  });

  const deleteWeaponTypeMutation = useMutation({
    mutationFn: (typeId: string) => deleteWeaponType(ruleSetId, typeId),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="rw-loading">Loading…</p>;
  if (error || !ruleSet) return <p className="rw-error">Failed to load rule set.</p>;

  const canEdit = ruleSet.isOwner;

  function startEditRuleSet() {
    setEditName(ruleSet!.name);
    setEditDesc(ruleSet!.description ?? '');
    setEditPublic(ruleSet!.isPublic);
    setEditingRuleSet(true);
  }

  return (
    <div className="rw-panel">
      <div className="rw-breadcrumb">
        <button className="rw-back" onClick={onBack}>← Rule Sets</button>
      </div>

      <div className="rw-panel-header">
        <h2 className="rw-panel-title">{ruleSet.name}</h2>
        <div className="rw-list-item-actions">
          <span className={`rw-visibility-badge ${ruleSet.isPublic ? 'rw-visibility-badge--public' : 'rw-visibility-badge--private'}`}>
            {ruleSet.isPublic ? 'Public' : 'Private'}
          </span>
          {canEdit && !editingRuleSet && (
            <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={startEditRuleSet}>Edit</button>
          )}
          {canEdit && (
            <button className="rw-btn rw-btn-danger-outline"
              onClick={() => { if (window.confirm(`Delete "${ruleSet.name}" and all its contents? This cannot be undone.`)) deleteRuleSetMutation.mutate(); }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {editingRuleSet && (
        <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!editName.trim()) return; updateRuleSetMutation.mutate({ name: editName.trim(), description: editDesc.trim() || undefined, isPublic: editPublic }); }}>
          <label className="rw-label">Name<input className="rw-input" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus /></label>
          <label className="rw-label">Description<input className="rw-input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Optional" /></label>
          <label className="rw-label rw-label--row">
            <input type="checkbox" checked={editPublic} onChange={(e) => setEditPublic(e.target.checked)} />
            Public
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={updateRuleSetMutation.isPending}>Save</button>
            <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditingRuleSet(false)}>Cancel</button>
          </div>
        </form>
      )}

      {ruleSet.description && !editingRuleSet && <p className="rw-description">{ruleSet.description}</p>}
      {!canEdit && <p className="rw-view-only">View only — owned by {ruleSet.ownerUsername ?? 'unknown'}</p>}

      {/* General Rules */}
      <section className="rw-section">
        <div className="rw-section-header">
          <h3 className="rw-section-title">General Rules</h3>
          {canEdit && (
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowRuleForm((v) => !v)}>
              {showRuleForm ? 'Cancel' : '+ Add Rule'}
            </button>
          )}
        </div>
        {canEdit && showRuleForm && (
          <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!ruleName.trim() || !ruleDesc.trim()) return; addRuleMutation.mutate({ name: ruleName.trim(), description: ruleDesc.trim() }); }}>
            <label className="rw-label">Name<input className="rw-input" value={ruleName} onChange={(e) => setRuleName(e.target.value)} autoFocus /></label>
            <label className="rw-label">Description<textarea className="rw-input rw-textarea" value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} rows={3} /></label>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={addRuleMutation.isPending}>Add Rule</button>
          </form>
        )}
        {ruleSet.generalRules.length === 0 && !showRuleForm && <p className="rw-empty">No general rules yet.</p>}
        <ul className="rw-list">
          {ruleSet.generalRules.map((r) => (
            <li key={r.id} className="rw-list-item rw-list-item--static">
              {editRuleId === r.id ? (
                <form onSubmit={(e) => { e.preventDefault(); if (!editRuleName.trim()) return; updateRuleMutation.mutate({ id: r.id, req: { name: editRuleName.trim(), description: editRuleDesc.trim() } }); }}>
                  <label className="rw-label">Name<input className="rw-input" value={editRuleName} onChange={(e) => setEditRuleName(e.target.value)} autoFocus /></label>
                  <label className="rw-label" style={{ marginTop: 8 }}>Description<textarea className="rw-input rw-textarea" value={editRuleDesc} onChange={(e) => setEditRuleDesc(e.target.value)} rows={3} /></label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="rw-btn rw-btn-primary" type="submit" disabled={updateRuleMutation.isPending}>Save</button>
                    <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditRuleId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="rw-list-item-row">
                    <span className="rw-list-item-name">{r.name}</span>
                    {canEdit && (
                      <div className="rw-list-item-actions">
                        <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '2px 8px' }}
                          onClick={() => { setEditRuleId(r.id); setEditRuleName(r.name); setEditRuleDesc(r.description); }}>Edit</button>
                        <button className="rw-btn-icon rw-btn-danger" onClick={() => { if (window.confirm(`Delete "${r.name}"?`)) deleteGeneralRuleMutation.mutate(r.id); }}>×</button>
                      </div>
                    )}
                  </div>
                  <span className="rw-list-item-desc">{r.description}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Abilities */}
      {canEdit && (
        <section className="rw-section">
          <div className="rw-section-header">
            <h3 className="rw-section-title">Abilities</h3>
          </div>
          <p className="rw-empty" style={{ margin: '0 0 8px' }}>Define reusable abilities for this rule set. Units can then be assigned abilities from this pool.</p>
          <ul className="rw-list" style={{ marginBottom: 12 }}>
            {ruleSet.abilities.map((ab: AbilitySummary) => (
              <li key={ab.id} className="rw-list-item rw-list-item--static">
                {editAbilityId === ab.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); if (!editAbilityName.trim()) return; updateAbilityMutation.mutate({ id: ab.id, name: editAbilityName.trim(), desc: editAbilityDesc.trim() }); }}>
                    <label className="rw-label">Name<input className="rw-input" value={editAbilityName} onChange={(e) => setEditAbilityName(e.target.value)} autoFocus /></label>
                    <label className="rw-label" style={{ marginTop: 8 }}>Description<textarea className="rw-input rw-textarea" value={editAbilityDesc} onChange={(e) => setEditAbilityDesc(e.target.value)} rows={2} /></label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="rw-btn rw-btn-primary" type="submit" disabled={updateAbilityMutation.isPending}>Save</button>
                      <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditAbilityId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="rw-list-item-row">
                      <span className="rw-list-item-name">{ab.name}</span>
                      <div className="rw-list-item-actions">
                        <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '2px 8px' }}
                          onClick={() => { setEditAbilityId(ab.id); setEditAbilityName(ab.name); setEditAbilityDesc(ab.description); }}>Edit</button>
                        <button className="rw-btn-icon rw-btn-danger" onClick={() => { if (window.confirm(`Delete ability "${ab.name}"?`)) deleteAbilityMutation.mutate(ab.id); }}>×</button>
                      </div>
                    </div>
                    {ab.description && <span className="rw-list-item-desc">{ab.description}</span>}
                  </>
                )}
              </li>
            ))}
          </ul>
          <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!newAbilityName.trim()) return; addAbilityMutation.mutate({ name: newAbilityName.trim(), desc: newAbilityDesc.trim() }); }}>
            <label className="rw-label">Ability Name<input className="rw-input" value={newAbilityName} onChange={(e) => setNewAbilityName(e.target.value)} placeholder="e.g. Rapid Fire" /></label>
            <label className="rw-label">Description<textarea className="rw-input rw-textarea" value={newAbilityDesc} onChange={(e) => setNewAbilityDesc(e.target.value)} placeholder="What does this ability do?" rows={2} /></label>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={addAbilityMutation.isPending}>Add Ability</button>
          </form>
        </section>
      )}

      {/* Unit Types */}
      {canEdit && (
        <section className="rw-section">
          <div className="rw-section-header">
            <h3 className="rw-section-title">Unit Types</h3>
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowUnitTypeForm((v) => !v)}>
              {showUnitTypeForm ? 'Cancel' : '+ Add Type'}
            </button>
          </div>
          {showUnitTypeForm && (
            <TypeForm ruleSetId={ruleSetId} kind="unit"
              onSave={async (body) => { await createUnitType(ruleSetId, body); invalidate(); setShowUnitTypeForm(false); }}
              onCancel={() => setShowUnitTypeForm(false)} />
          )}
          <ul className="rw-list">
            {ruleSet.unitTypes.map((t) => (
              <TypeItem key={t.id} type={t} ruleSetId={ruleSetId} kind="unit" onUpdated={invalidate}
                onDelete={() => { if (!window.confirm(`Delete unit type "${t.name}"?`)) return; deleteUnitTypeMutation.mutate(t.id); }} />
            ))}
          </ul>
        </section>
      )}

      {/* Weapon Types */}
      {canEdit && (
        <section className="rw-section">
          <div className="rw-section-header">
            <h3 className="rw-section-title">Weapon Types</h3>
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowWeaponTypeForm((v) => !v)}>
              {showWeaponTypeForm ? 'Cancel' : '+ Add Type'}
            </button>
          </div>
          {showWeaponTypeForm && (
            <TypeForm ruleSetId={ruleSetId} kind="weapon"
              onSave={async (body) => { await createWeaponType(ruleSetId, body); invalidate(); setShowWeaponTypeForm(false); }}
              onCancel={() => setShowWeaponTypeForm(false)} />
          )}
          <ul className="rw-list">
            {ruleSet.weaponTypes.map((t) => (
              <TypeItem key={t.id} type={t} ruleSetId={ruleSetId} kind="weapon" onUpdated={invalidate}
                onDelete={() => { if (!window.confirm(`Delete weapon type "${t.name}"?`)) return; deleteWeaponTypeMutation.mutate(t.id); }} />
            ))}
          </ul>
        </section>
      )}

      {/* Factions */}
      <section className="rw-section">
        <div className="rw-section-header">
          <h3 className="rw-section-title">Factions</h3>
          {canEdit && (
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowFactionForm((v) => !v)}>
              {showFactionForm ? 'Cancel' : '+ Add Faction'}
            </button>
          )}
        </div>
        {canEdit && showFactionForm && (
          <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!factionName.trim()) return; addFactionMutation.mutate({ name: factionName.trim(), description: factionDesc.trim() || undefined }); }}>
            <label className="rw-label">Name<input className="rw-input" value={factionName} onChange={(e) => setFactionName(e.target.value)} autoFocus /></label>
            <label className="rw-label">Description<input className="rw-input" value={factionDesc} onChange={(e) => setFactionDesc(e.target.value)} placeholder="Optional" /></label>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={addFactionMutation.isPending}>Add Faction</button>
          </form>
        )}
        {ruleSet.factions.length === 0 && !showFactionForm && <p className="rw-empty">No factions yet.</p>}
        <ul className="rw-list">
          {ruleSet.factions.map((f: FactionSummary) => (
            <li key={f.id} className="rw-list-item" onClick={() => onSelectFaction(f.id, canEdit)}>
              <div className="rw-list-item-row">
                <span className="rw-list-item-name">{f.name}</span>
                {canEdit && (
                  <button className="rw-btn-icon rw-btn-danger" title="Delete faction"
                    onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${f.name}" and all its rules, units, and weapons?`)) deleteFactionMutation.mutate(f.id); }}>×</button>
                )}
              </div>
              {f.description && <span className="rw-list-item-desc">{f.description}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ── Type form (create/edit) ───────────────────────────────────────────────────

interface TypeFormBody {
  name: string;
  statLine: string[];
  abilities: string[];
  rules: SimpleRule[];
}

function TypeForm({
  ruleSetId: _ruleSetId,
  kind: _kind,
  initial,
  onSave,
  onCancel,
}: {
  ruleSetId: string;
  kind: 'unit' | 'weapon';
  initial?: { name: string; statLine: string[]; abilities: string[]; rules: SimpleRule[] };
  onSave: (body: TypeFormBody) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [statLine, setStatLine] = useState(initial?.statLine.join(', ') ?? '');
  const [abilities, setAbilities] = useState(initial?.abilities.join(', ') ?? '');
  const [rules, setRules] = useState<SimpleRule[]>(initial?.rules ?? []);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        statLine: statLine.split(',').map((s) => s.trim()).filter(Boolean),
        abilities: abilities.split(',').map((s) => s.trim()).filter(Boolean),
        rules,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rw-form" onSubmit={handleSubmit}>
      <label className="rw-label">
        Name
        <input className="rw-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <label className="rw-label">
        Stat Line
        <input className="rw-input" value={statLine} onChange={(e) => setStatLine(e.target.value)} placeholder="e.g. Movement, Toughness, Save" />
        <span style={{ fontSize: 11, color: '#6b6050' }}>Comma-separated stat names</span>
      </label>
      <label className="rw-label">
        Abilities / Keywords
        <input className="rw-input" value={abilities} onChange={(e) => setAbilities(e.target.value)} placeholder="e.g. Infantry, Character" />
        <span style={{ fontSize: 11, color: '#6b6050' }}>Comma-separated labels for this type</span>
      </label>
      <div className="rw-label">
        Rules
        {rules.length > 0 && (
          <ul className="rw-list" style={{ marginBottom: 8 }}>
            {rules.map((r, i) => (
              <li key={i} className="rw-list-item rw-list-item--static">
                <div className="rw-list-item-row">
                  <span className="rw-list-item-name">{r.name}</span>
                  <button type="button" className="rw-btn-icon rw-btn-danger"
                    onClick={() => setRules((prev) => prev.filter((_, j) => j !== i))}>×</button>
                </div>
                <span className="rw-list-item-desc">{r.description}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
          <input className="rw-input" value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)} placeholder="Rule name" />
          <input className="rw-input" value={newRuleDesc} onChange={(e) => setNewRuleDesc(e.target.value)} placeholder="Rule description" />
          <button type="button" className="rw-btn rw-btn-secondary"
            onClick={() => { if (!newRuleName.trim()) return; setRules((prev) => [...prev, { name: newRuleName.trim(), description: newRuleDesc.trim() }]); setNewRuleName(''); setNewRuleDesc(''); }}>
            + Add Rule
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="rw-btn rw-btn-primary" type="submit" disabled={saving}>Save</button>
        <button className="rw-btn rw-btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ── Type item (expand/collapse edit) ─────────────────────────────────────────

function TypeItem({
  type,
  ruleSetId,
  kind,
  onUpdated,
  onDelete,
}: {
  type: UnitTypeResponse | WeaponTypeResponse;
  ruleSetId: string;
  kind: 'unit' | 'weapon';
  onUpdated: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isNonDeletable = 'isStandard' in type ? type.isStandard : !type.isDeletable;
  const nonDeletableLabel = 'isStandard' in type ? 'The Standard unit type cannot be deleted' : 'This weapon type cannot be deleted';

  return (
    <li className="rw-list-item rw-list-item--static">
      <div className="rw-list-item-row">
        <div>
          <span className="rw-list-item-name">{type.name}</span>
          {type.statLine.length > 0 && (
            <span className="rw-list-item-desc" style={{ marginLeft: 8 }}>{type.statLine.join(' / ')}</span>
          )}
        </div>
        <div className="rw-list-item-actions">
          <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }}
            onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <span title={isNonDeletable ? nonDeletableLabel : undefined}>
            <button className="rw-btn-icon rw-btn-danger" disabled={isNonDeletable} onClick={onDelete}
              style={{ cursor: isNonDeletable ? 'not-allowed' : undefined }}>×</button>
          </span>
        </div>
      </div>
      {isEditing && (
        <div style={{ marginTop: 10 }}>
          <TypeForm ruleSetId={ruleSetId} kind={kind}
            initial={{ name: type.name, statLine: type.statLine, abilities: type.abilities, rules: type.rules }}
            onSave={async (body) => {
              if (kind === 'unit') await updateUnitType(ruleSetId, type.id, body);
              else await updateWeaponType(ruleSetId, type.id, body);
              onUpdated();
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)} />
        </div>
      )}
    </li>
  );
}

// ── Faction detail ────────────────────────────────────────────────────────────

function FactionDetail({
  ruleSetId,
  factionId,
  isOwner,
  onBack,
  onSelectUnit,
}: {
  ruleSetId: string;
  factionId: string;
  isOwner: boolean;
  onBack: () => void;
  onSelectUnit: (unitId: string, unitName: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data: faction, isLoading, error } = useQuery({
    queryKey: ['faction', ruleSetId, factionId],
    queryFn: () => fetchFaction(ruleSetId, factionId),
  });

  const { data: weaponTypes = [] } = useQuery({
    queryKey: ['weaponTypes', ruleSetId],
    queryFn: () => fetchWeaponTypes(ruleSetId),
    enabled: isOwner,
  });

  const { data: unitTypes = [] } = useQuery({
    queryKey: ['unitTypes', ruleSetId],
    queryFn: () => fetchUnitTypes(ruleSetId),
    enabled: isOwner,
  });

  const { data: ruleSetData } = useQuery({
    queryKey: ['ruleSet', ruleSetId],
    queryFn: () => fetchRuleSet(ruleSetId),
    enabled: isOwner,
  });
  const abilityPool: AbilitySummary[] = ruleSetData?.abilities ?? [];

  const [editingFaction, setEditingFaction] = useState(false);
  const [editFactionName, setEditFactionName] = useState('');
  const [editFactionDesc, setEditFactionDesc] = useState('');

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [editRuleName, setEditRuleName] = useState('');
  const [editRuleDesc, setEditRuleDesc] = useState('');

  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editUnitId, setEditUnitId] = useState<string | null>(null);

  const [showWeaponForm, setShowWeaponForm] = useState(false);
  const [editWeaponId, setEditWeaponId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['faction', ruleSetId, factionId] });

  const updateFactionMutation = useMutation({
    mutationFn: (req: { name: string; description?: string }) => updateFaction(ruleSetId, factionId, req),
    onSuccess: () => { invalidate(); setEditingFaction(false); },
  });

  const addRuleMutation = useMutation({
    mutationFn: (req: { name: string; description: string }) => createFactionRule(ruleSetId, factionId, req),
    onSuccess: () => { invalidate(); setShowRuleForm(false); setRuleName(''); setRuleDesc(''); },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, req }: { id: string; req: { name: string; description: string } }) =>
      updateFactionRule(ruleSetId, factionId, id, req),
    onSuccess: () => { invalidate(); setEditRuleId(null); },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => deleteFactionRule(ruleSetId, factionId, ruleId),
    onSuccess: invalidate,
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (unitId: string) => deleteUnit(ruleSetId, factionId, unitId),
    onSuccess: invalidate,
  });

  const deleteWeaponMutation = useMutation({
    mutationFn: (weaponId: string) => deleteWeapon(ruleSetId, factionId, weaponId),
    onSuccess: invalidate,
  });

  const [createUnitName, setCreateUnitName] = useState('');
  const [createUnitPts, setCreateUnitPts] = useState('');
  const [createUnitTypeId, setCreateUnitTypeId] = useState('');
  const [createUnitStats, setCreateUnitStats] = useState<Record<string, string>>({});
  const [createUnitAbilities, setCreateUnitAbilities] = useState<string[]>([]);

  const [createWeaponName, setCreateWeaponName] = useState('');
  const [createWeaponPts, setCreateWeaponPts] = useState('');
  const [createWeaponTypeId, setCreateWeaponTypeId] = useState('');
  const [createWeaponStats, setCreateWeaponStats] = useState<Record<string, string>>({});
  const [createWeaponAbilities, setCreateWeaponAbilities] = useState<string[]>([]);

  const selectedCreateUnitType = unitTypes.find((ut) => ut.id === createUnitTypeId);
  const selectedWeaponTypeForCreate = weaponTypes.find((wt) => wt.id === createWeaponTypeId);

  const addUnitMutation = useMutation({
    mutationFn: (req: Parameters<typeof createUnit>[2]) => createUnit(ruleSetId, factionId, req),
    onSuccess: () => {
      invalidate();
      setShowUnitForm(false);
      setCreateUnitName(''); setCreateUnitPts(''); setCreateUnitTypeId(''); setCreateUnitStats({}); setCreateUnitAbilities([]);
    },
  });

  const addWeaponMutation = useMutation({
    mutationFn: (req: Parameters<typeof createWeapon>[2]) => createWeapon(ruleSetId, factionId, req),
    onSuccess: () => {
      invalidate();
      setShowWeaponForm(false);
      setCreateWeaponName(''); setCreateWeaponPts(''); setCreateWeaponTypeId(''); setCreateWeaponStats({}); setCreateWeaponAbilities([]);
    },
  });

  if (isLoading) return <p className="rw-loading">Loading…</p>;
  if (error || !faction) return <p className="rw-error">Failed to load faction.</p>;

  return (
    <div className="rw-panel">
      <div className="rw-breadcrumb">
        <button className="rw-back" onClick={onBack}>← Rule Set</button>
      </div>

      <div className="rw-panel-header">
        <h2 className="rw-panel-title">{faction.name}</h2>
        {isOwner && !editingFaction && (
          <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }}
            onClick={() => { setEditFactionName(faction.name); setEditFactionDesc(faction.description ?? ''); setEditingFaction(true); }}>
            Edit
          </button>
        )}
      </div>

      {editingFaction && (
        <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!editFactionName.trim()) return; updateFactionMutation.mutate({ name: editFactionName.trim(), description: editFactionDesc.trim() || undefined }); }}>
          <label className="rw-label">Name<input className="rw-input" value={editFactionName} onChange={(e) => setEditFactionName(e.target.value)} autoFocus /></label>
          <label className="rw-label">Description<input className="rw-input" value={editFactionDesc} onChange={(e) => setEditFactionDesc(e.target.value)} placeholder="Optional" /></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={updateFactionMutation.isPending}>Save</button>
            <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditingFaction(false)}>Cancel</button>
          </div>
        </form>
      )}

      {faction.description && !editingFaction && <p className="rw-description">{faction.description}</p>}
      {!isOwner && <p className="rw-view-only">View only</p>}

      {/* Faction Rules */}
      <section className="rw-section">
        <div className="rw-section-header">
          <h3 className="rw-section-title">Faction Rules</h3>
          {isOwner && (
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowRuleForm((v) => !v)}>
              {showRuleForm ? 'Cancel' : '+ Add Rule'}
            </button>
          )}
        </div>
        {isOwner && showRuleForm && (
          <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!ruleName.trim() || !ruleDesc.trim()) return; addRuleMutation.mutate({ name: ruleName.trim(), description: ruleDesc.trim() }); }}>
            <label className="rw-label">Name<input className="rw-input" value={ruleName} onChange={(e) => setRuleName(e.target.value)} autoFocus /></label>
            <label className="rw-label">Description<textarea className="rw-input rw-textarea" value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} rows={3} /></label>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={addRuleMutation.isPending}>Add Rule</button>
          </form>
        )}
        {faction.factionRules.length === 0 && !showRuleForm && <p className="rw-empty">No faction rules yet.</p>}
        <ul className="rw-list">
          {faction.factionRules.map((r) => (
            <li key={r.id} className="rw-list-item rw-list-item--static">
              {editRuleId === r.id ? (
                <form onSubmit={(e) => { e.preventDefault(); if (!editRuleName.trim()) return; updateRuleMutation.mutate({ id: r.id, req: { name: editRuleName.trim(), description: editRuleDesc.trim() } }); }}>
                  <label className="rw-label">Name<input className="rw-input" value={editRuleName} onChange={(e) => setEditRuleName(e.target.value)} autoFocus /></label>
                  <label className="rw-label" style={{ marginTop: 8 }}>Description<textarea className="rw-input rw-textarea" value={editRuleDesc} onChange={(e) => setEditRuleDesc(e.target.value)} rows={3} /></label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="rw-btn rw-btn-primary" type="submit" disabled={updateRuleMutation.isPending}>Save</button>
                    <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditRuleId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="rw-list-item-row">
                    <span className="rw-list-item-name">{r.name}</span>
                    {isOwner && (
                      <div className="rw-list-item-actions">
                        <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '2px 8px' }}
                          onClick={() => { setEditRuleId(r.id); setEditRuleName(r.name); setEditRuleDesc(r.description); }}>Edit</button>
                        <button className="rw-btn-icon rw-btn-danger"
                          onClick={() => { if (window.confirm(`Delete "${r.name}"?`)) deleteRuleMutation.mutate(r.id); }}>×</button>
                      </div>
                    )}
                  </div>
                  <span className="rw-list-item-desc">{r.description}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Weapons */}
      <section className="rw-section">
        <div className="rw-section-header">
          <h3 className="rw-section-title">Weapons</h3>
          {isOwner && (
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowWeaponForm((v) => !v)}>
              {showWeaponForm ? 'Cancel' : '+ Add Weapon'}
            </button>
          )}
        </div>
        {isOwner && showWeaponForm && (
          <form className="rw-form" onSubmit={(e) => {
            e.preventDefault();
            if (!createWeaponName.trim()) return;
            addWeaponMutation.mutate({
              name: createWeaponName.trim(),
              weaponTypeId: createWeaponTypeId || null,
              pointsCost: parseInt(createWeaponPts) || 0,
              stats: createWeaponStats,
              abilities: createWeaponAbilities,
              rules: [],
            });
          }}>
            <label className="rw-label">Name<input className="rw-input" value={createWeaponName} onChange={(e) => setCreateWeaponName(e.target.value)} autoFocus /></label>
            <label className="rw-label">
              Type
              <select className="rw-input" value={createWeaponTypeId} onChange={(e) => { setCreateWeaponTypeId(e.target.value); setCreateWeaponStats({}); }}>
                <option value="">— None —</option>
                {weaponTypes.map((wt) => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
              </select>
            </label>
            <label className="rw-label">Points Cost<input className="rw-input rw-input-narrow" type="number" min="0" value={createWeaponPts} onChange={(e) => setCreateWeaponPts(e.target.value)} placeholder="0" /></label>
            {selectedWeaponTypeForCreate?.statLine.map((stat) => (
              <label key={stat} className="rw-label">
                {stat}
                <input className="rw-input rw-input-narrow" value={createWeaponStats[stat] ?? ''} onChange={(e) => setCreateWeaponStats((prev) => ({ ...prev, [stat]: e.target.value }))} />
              </label>
            ))}
            {abilityPool.length > 0 && (
              <div className="rw-label">
                Abilities
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {abilityPool.map((ab) => (
                    <label key={ab.id} className="rw-label rw-label--row" title={ab.description}>
                      <input type="checkbox" checked={createWeaponAbilities.includes(ab.name)}
                        onChange={(e) => setCreateWeaponAbilities((prev) => e.target.checked ? [...prev, ab.name] : prev.filter((a) => a !== ab.name))} />
                      {ab.name}
                      {ab.description && <span style={{ fontSize: 11, color: '#6b6050', marginLeft: 4 }}>— {ab.description}</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button className="rw-btn rw-btn-primary" type="submit" disabled={addWeaponMutation.isPending}>Add Weapon</button>
          </form>
        )}
        {faction.weapons.length === 0 && !showWeaponForm && <p className="rw-empty">No weapons yet.</p>}
        <ul className="rw-list">
          {faction.weapons.map((w: WeaponResponse) => (
            <WeaponItem
              key={w.id}
              weapon={w}
              isOwner={isOwner}
              weaponTypes={weaponTypes}
              abilityPool={abilityPool}
              onUpdated={invalidate}
              onDelete={() => { if (window.confirm(`Delete "${w.name}"?`)) deleteWeaponMutation.mutate(w.id); }}
              ruleSetId={ruleSetId}
              factionId={factionId}
              editWeaponId={editWeaponId}
              setEditWeaponId={setEditWeaponId}
            />
          ))}
        </ul>
      </section>

      {/* Units */}
      <section className="rw-section">
        <div className="rw-section-header">
          <h3 className="rw-section-title">Units</h3>
          {isOwner && (
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowUnitForm((v) => !v)}>
              {showUnitForm ? 'Cancel' : '+ Add Unit'}
            </button>
          )}
        </div>
        {isOwner && showUnitForm && (
          <form className="rw-form" onSubmit={(e) => {
            e.preventDefault();
            if (!createUnitName.trim()) return;
            addUnitMutation.mutate({
              name: createUnitName.trim(),
              pointsCost: parseInt(createUnitPts) || 0,
              unitTypeId: createUnitTypeId || null,
              stats: createUnitStats,
              abilities: createUnitAbilities,
            });
          }}>
            <label className="rw-label">Name<input className="rw-input" value={createUnitName} onChange={(e) => setCreateUnitName(e.target.value)} autoFocus /></label>
            <label className="rw-label">Points Cost<input className="rw-input rw-input-narrow" type="number" min="0" value={createUnitPts} onChange={(e) => setCreateUnitPts(e.target.value)} placeholder="0" /></label>
            <label className="rw-label">
              Unit Type
              <select className="rw-input" value={createUnitTypeId} onChange={(e) => { setCreateUnitTypeId(e.target.value); setCreateUnitStats({}); }}>
                <option value="">— None —</option>
                {unitTypes.map((ut) => <option key={ut.id} value={ut.id}>{ut.name}</option>)}
              </select>
            </label>
            {selectedCreateUnitType?.statLine.map((stat) => (
              <label key={stat} className="rw-label">
                {stat}
                <input className="rw-input rw-input-narrow" value={createUnitStats[stat] ?? ''} onChange={(e) => setCreateUnitStats((prev) => ({ ...prev, [stat]: e.target.value }))} />
              </label>
            ))}
            {abilityPool.length > 0 && (
              <div className="rw-label">
                Abilities
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {abilityPool.map((ab) => (
                    <label key={ab.id} className="rw-label rw-label--row" title={ab.description}>
                      <input type="checkbox" checked={createUnitAbilities.includes(ab.name)}
                        onChange={(e) => setCreateUnitAbilities((prev) => e.target.checked ? [...prev, ab.name] : prev.filter((a) => a !== ab.name))} />
                      {ab.name}
                      {ab.description && <span style={{ fontSize: 11, color: '#6b6050', marginLeft: 4 }}>— {ab.description}</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button className="rw-btn rw-btn-primary" type="submit" disabled={addUnitMutation.isPending}>Add Unit</button>
          </form>
        )}
        {faction.units.length === 0 && !showUnitForm && <p className="rw-empty">No units yet.</p>}
        <ul className="rw-list">
          {faction.units.map((u: UnitSummary) => (
            <UnitItem
              key={u.id}
              unit={u}
              isOwner={isOwner}
              unitTypes={unitTypes}
              abilityPool={abilityPool}
              onSelect={() => onSelectUnit(u.id, u.name)}
              onUpdated={invalidate}
              onDelete={() => { if (window.confirm(`Delete "${u.name}"?`)) deleteUnitMutation.mutate(u.id); }}
              ruleSetId={ruleSetId}
              factionId={factionId}
              editUnitId={editUnitId}
              setEditUnitId={setEditUnitId}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

// ── Unit item (with inline edit) ──────────────────────────────────────────────

function UnitItem({
  unit,
  isOwner,
  unitTypes,
  abilityPool,
  onSelect,
  onUpdated,
  onDelete,
  ruleSetId,
  factionId,
  editUnitId,
  setEditUnitId,
}: {
  unit: UnitSummary;
  isOwner: boolean;
  unitTypes: UnitTypeResponse[];
  abilityPool: AbilitySummary[];
  onSelect: () => void;
  onUpdated: () => void;
  onDelete: () => void;
  ruleSetId: string;
  factionId: string;
  editUnitId: string | null;
  setEditUnitId: (id: string | null) => void;
}) {
  const isEditing = editUnitId === unit.id;
  const [editName, setEditName] = useState(unit.name);
  const [editPts, setEditPts] = useState(String(unit.pointsCost));
  const [editTypeId, setEditTypeId] = useState(() => unitTypes.find((ut) => ut.name === unit.unitTypeName)?.id ?? '');
  const [editStats, setEditStats] = useState<Record<string, string>>(unit.stats ?? {});
  const [editAbilities, setEditAbilities] = useState<string[]>(unit.abilities ?? []);

  const selectedType = unitTypes.find((ut) => ut.id === editTypeId);

  const updateUnitMutation = useMutation({
    mutationFn: (req: Parameters<typeof updateUnit>[3]) => updateUnit(ruleSetId, factionId, unit.id, req),
    onSuccess: () => { onUpdated(); setEditUnitId(null); },
  });

  function startEdit() {
    setEditName(unit.name);
    setEditPts(String(unit.pointsCost));
    setEditTypeId(unitTypes.find((ut) => ut.name === unit.unitTypeName)?.id ?? '');
    setEditStats(unit.stats ?? {});
    setEditAbilities(unit.abilities ?? []);
    setEditUnitId(unit.id);
  }

  return (
    <li className="rw-list-item" onClick={isEditing ? undefined : onSelect} style={isEditing ? { cursor: 'default' } : undefined}>
      <div className="rw-list-item-row">
        <div>
          <span className="rw-list-item-name">{unit.name}</span>
          {unit.unitTypeName && <span className="rw-list-item-desc" style={{ marginLeft: 8 }}>{unit.unitTypeName}</span>}
        </div>
        <div className="rw-list-item-actions" onClick={(e) => e.stopPropagation()}>
          <span className="rw-list-item-pts">{unit.pointsCost} pts</span>
          {unit.weaponSetCount > 0 && (
            <span className="rw-visibility-badge rw-visibility-badge--public">{unit.weaponSetCount} set{unit.weaponSetCount !== 1 ? 's' : ''}</span>
          )}
          {isOwner && (
            <>
              <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '2px 8px' }}
                onClick={isEditing ? () => setEditUnitId(null) : startEdit}>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button className="rw-btn-icon rw-btn-danger" onClick={onDelete}>×</button>
            </>
          )}
        </div>
      </div>
      {isEditing && (
        <form style={{ marginTop: 10 }} onSubmit={(e) => {
          e.preventDefault();
          if (!editName.trim()) return;
          updateUnitMutation.mutate({
            name: editName.trim(),
            pointsCost: parseInt(editPts) || 0,
            unitTypeId: editTypeId || null,
            stats: editStats,
            abilities: editAbilities,
          });
        }} onClick={(e) => e.stopPropagation()}>
          <label className="rw-label">Name<input className="rw-input" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus /></label>
          <label className="rw-label" style={{ marginTop: 8 }}>Points Cost<input className="rw-input rw-input-narrow" type="number" min="0" value={editPts} onChange={(e) => setEditPts(e.target.value)} /></label>
          <label className="rw-label" style={{ marginTop: 8 }}>
            Unit Type
            <select className="rw-input" value={editTypeId} onChange={(e) => { setEditTypeId(e.target.value); setEditStats({}); }}>
              <option value="">— None —</option>
              {unitTypes.map((ut) => <option key={ut.id} value={ut.id}>{ut.name}</option>)}
            </select>
          </label>
          {selectedType?.statLine.map((stat) => (
            <label key={stat} className="rw-label" style={{ marginTop: 8 }}>
              {stat}
              <input className="rw-input rw-input-narrow" value={editStats[stat] ?? ''} onChange={(e) => setEditStats((prev) => ({ ...prev, [stat]: e.target.value }))} />
            </label>
          ))}
          {abilityPool.length > 0 && (
            <div className="rw-label" style={{ marginTop: 8 }}>
              Abilities
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {abilityPool.map((ab) => (
                  <label key={ab.id} className="rw-label rw-label--row" title={ab.description}>
                    <input type="checkbox" checked={editAbilities.includes(ab.name)}
                      onChange={(ev) => setEditAbilities((prev) => ev.target.checked ? [...prev, ab.name] : prev.filter((a) => a !== ab.name))} />
                    {ab.name}
                    {ab.description && <span style={{ fontSize: 11, color: '#6b6050', marginLeft: 4 }}>— {ab.description}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={updateUnitMutation.isPending}>Save</button>
            <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditUnitId(null)}>Cancel</button>
          </div>
          {updateUnitMutation.isError && <p className="rw-error">Failed to save.</p>}
        </form>
      )}
    </li>
  );
}

// ── Weapon item (with inline edit) ────────────────────────────────────────────

function WeaponItem({
  weapon,
  isOwner,
  weaponTypes,
  abilityPool,
  onUpdated,
  onDelete,
  ruleSetId,
  factionId,
  editWeaponId,
  setEditWeaponId,
}: {
  weapon: WeaponResponse;
  isOwner: boolean;
  weaponTypes: WeaponTypeResponse[];
  abilityPool: AbilitySummary[];
  onUpdated: () => void;
  onDelete: () => void;
  ruleSetId: string;
  factionId: string;
  editWeaponId: string | null;
  setEditWeaponId: (id: string | null) => void;
}) {
  const isEditing = editWeaponId === weapon.id;
  const [editName, setEditName] = useState(weapon.name);
  const [editPts, setEditPts] = useState(String(weapon.pointsCost));
  const [editTypeId, setEditTypeId] = useState(() => weaponTypes.find((wt) => wt.name === weapon.weaponTypeName)?.id ?? '');
  const [editStats, setEditStats] = useState<Record<string, string>>(weapon.stats ?? {});
  const [editAbilities, setEditAbilities] = useState<string[]>(weapon.abilities ?? []);

  const selectedType = weaponTypes.find((wt) => wt.id === editTypeId);

  const updateWeaponMutation = useMutation({
    mutationFn: (req: Parameters<typeof updateWeapon>[3]) => updateWeapon(ruleSetId, factionId, weapon.id, req),
    onSuccess: () => { onUpdated(); setEditWeaponId(null); },
  });

  function startEdit() {
    setEditName(weapon.name);
    setEditPts(String(weapon.pointsCost));
    setEditTypeId(weaponTypes.find((wt) => wt.name === weapon.weaponTypeName)?.id ?? '');
    setEditStats(weapon.stats ?? {});
    setEditAbilities(weapon.abilities ?? []);
    setEditWeaponId(weapon.id);
  }

  return (
    <li className="rw-list-item rw-list-item--static">
      <div className="rw-list-item-row">
        <div>
          <span className="rw-list-item-name">{weapon.name}</span>
          {weapon.weaponTypeName && <span className="rw-list-item-desc" style={{ marginLeft: 8 }}>{weapon.weaponTypeName}</span>}
        </div>
        <div className="rw-list-item-actions">
          <span className="rw-list-item-pts">{weapon.pointsCost} pts</span>
          {isOwner && (
            <>
              <button className="rw-btn rw-btn-secondary" style={{ fontSize: 12, padding: '2px 8px' }}
                onClick={isEditing ? () => setEditWeaponId(null) : startEdit}>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button className="rw-btn-icon rw-btn-danger" onClick={onDelete}>×</button>
            </>
          )}
        </div>
      </div>
      {Object.keys(weapon.stats).length > 0 && !isEditing && (
        <div className="rw-stat-line">
          {Object.entries(weapon.stats).map(([k, v]) => (
            <span key={k} className="rw-stat-chip"><span className="rw-stat-chip-label">{k}</span>{v}</span>
          ))}
        </div>
      )}
      {isEditing && (
        <form style={{ marginTop: 10 }} onSubmit={(e) => {
          e.preventDefault();
          if (!editName.trim()) return;
          updateWeaponMutation.mutate({
            name: editName.trim(),
            pointsCost: parseInt(editPts) || 0,
            weaponTypeId: editTypeId || null,
            stats: editStats,
            abilities: editAbilities,
            rules: weapon.rules,
          });
        }}>
          <label className="rw-label">Name<input className="rw-input" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus /></label>
          <label className="rw-label" style={{ marginTop: 8 }}>
            Type
            <select className="rw-input" value={editTypeId} onChange={(e) => { setEditTypeId(e.target.value); setEditStats({}); }}>
              <option value="">— None —</option>
              {weaponTypes.map((wt) => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
            </select>
          </label>
          <label className="rw-label" style={{ marginTop: 8 }}>Points Cost<input className="rw-input rw-input-narrow" type="number" min="0" value={editPts} onChange={(e) => setEditPts(e.target.value)} /></label>
          {selectedType?.statLine.map((stat) => (
            <label key={stat} className="rw-label" style={{ marginTop: 8 }}>
              {stat}
              <input className="rw-input rw-input-narrow" value={editStats[stat] ?? ''} onChange={(e) => setEditStats((prev) => ({ ...prev, [stat]: e.target.value }))} />
            </label>
          ))}
          {abilityPool.length > 0 && (
            <div className="rw-label" style={{ marginTop: 8 }}>
              Abilities
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {abilityPool.map((ab) => (
                  <label key={ab.id} className="rw-label rw-label--row" title={ab.description}>
                    <input type="checkbox" checked={editAbilities.includes(ab.name)}
                      onChange={(ev) => setEditAbilities((prev) => ev.target.checked ? [...prev, ab.name] : prev.filter((a) => a !== ab.name))} />
                    {ab.name}
                    {ab.description && <span style={{ fontSize: 11, color: '#6b6050', marginLeft: 4 }}>— {ab.description}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={updateWeaponMutation.isPending}>Save</button>
            <button className="rw-btn rw-btn-secondary" type="button" onClick={() => setEditWeaponId(null)}>Cancel</button>
          </div>
        </form>
      )}
    </li>
  );
}

// ── Unit detail (weapon sets) ─────────────────────────────────────────────────

function UnitDetail({
  ruleSetId,
  factionId,
  unitId,
  unitName,
  isOwner,
  onBack,
}: {
  ruleSetId: string;
  factionId: string;
  unitId: string;
  unitName: string;
  isOwner: boolean;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: weaponSets = [], isLoading, error } = useQuery({
    queryKey: ['weaponSets', ruleSetId, factionId, unitId],
    queryFn: () => fetchWeaponSets(ruleSetId, factionId, unitId),
  });

  const { data: faction } = useQuery({
    queryKey: ['faction', ruleSetId, factionId],
    queryFn: () => fetchFaction(ruleSetId, factionId),
  });

  const factionWeapons = faction?.weapons ?? [];

  const [showSetForm, setShowSetForm] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDefault, setNewSetDefault] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['weaponSets', ruleSetId, factionId, unitId] });

  const createSetMutation = useMutation({
    mutationFn: (body: { name: string; isDefault: boolean }) => createWeaponSet(ruleSetId, factionId, unitId, body),
    onSuccess: () => { invalidate(); setShowSetForm(false); setNewSetName(''); setNewSetDefault(false); },
  });

  const deleteSetMutation = useMutation({
    mutationFn: (setId: string) => deleteWeaponSet(ruleSetId, factionId, unitId, setId),
    onSuccess: invalidate,
  });

  const setDefaultMutation = useMutation({
    mutationFn: (setId: string) => updateWeaponSet(ruleSetId, factionId, unitId, setId, { isDefault: true }),
    onSuccess: invalidate,
  });

  const addWeaponToSetMutation = useMutation({
    mutationFn: ({ setId, weaponId }: { setId: string; weaponId: string }) =>
      addWeaponToSet(ruleSetId, factionId, unitId, setId, weaponId),
    onSuccess: invalidate,
  });

  const removeEntryMutation = useMutation({
    mutationFn: ({ setId, entryId }: { setId: string; entryId: string }) =>
      removeEntryFromSet(ruleSetId, factionId, unitId, setId, entryId),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="rw-loading">Loading…</p>;
  if (error) return <p className="rw-error">Failed to load weapon sets.</p>;

  return (
    <div className="rw-panel">
      <div className="rw-breadcrumb">
        <button className="rw-back" onClick={onBack}>← Faction</button>
      </div>

      <h2 className="rw-panel-title">{unitName}</h2>
      {!isOwner && <p className="rw-view-only">View only</p>}

      <section className="rw-section">
        <div className="rw-section-header">
          <h3 className="rw-section-title">Weapon Sets</h3>
          {isOwner && (
            <button className="rw-btn rw-btn-secondary" onClick={() => setShowSetForm((v) => !v)}>
              {showSetForm ? 'Cancel' : '+ Add Set'}
            </button>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#6b6050', margin: '0 0 12px' }}>
          Weapon sets give players a choice of equipment. One set must be marked as default.
        </p>

        {isOwner && showSetForm && (
          <form className="rw-form" onSubmit={(e) => { e.preventDefault(); if (!newSetName.trim()) return; createSetMutation.mutate({ name: newSetName.trim(), isDefault: newSetDefault }); }}>
            <label className="rw-label">Set Name<input className="rw-input" value={newSetName} onChange={(e) => setNewSetName(e.target.value)} autoFocus placeholder="e.g. Bolt Rifle" /></label>
            <label className="rw-label rw-label--row">
              <input type="checkbox" checked={newSetDefault} onChange={(e) => setNewSetDefault(e.target.checked)} />
              Default weapon set
            </label>
            <button className="rw-btn rw-btn-primary" type="submit" disabled={createSetMutation.isPending}>Create Set</button>
          </form>
        )}

        {weaponSets.length === 0 && !showSetForm && <p className="rw-empty">No weapon sets yet.</p>}

        <ul className="rw-list">
          {weaponSets.map((ws: WeaponSetResponse) => (
            <WeaponSetItem
              key={ws.id}
              set={ws}
              isOwner={isOwner}
              factionWeapons={factionWeapons}
              onSetDefault={() => setDefaultMutation.mutate(ws.id)}
              onDelete={() => { if (window.confirm(`Delete weapon set "${ws.name}"?`)) deleteSetMutation.mutate(ws.id); }}
              onAddWeapon={(weaponId) => addWeaponToSetMutation.mutate({ setId: ws.id, weaponId })}
              onRemoveEntry={(entryId) => removeEntryMutation.mutate({ setId: ws.id, entryId })}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function WeaponSetItem({
  set,
  isOwner,
  factionWeapons,
  onSetDefault,
  onDelete,
  onAddWeapon,
  onRemoveEntry,
}: {
  set: WeaponSetResponse;
  isOwner: boolean;
  factionWeapons: WeaponResponse[];
  onSetDefault: () => void;
  onDelete: () => void;
  onAddWeapon: (weaponId: string) => void;
  onRemoveEntry: (entryId: string) => void;
}) {
  const [selectedWeaponId, setSelectedWeaponId] = useState('');

  return (
    <li className="rw-list-item rw-list-item--static">
      <div className="rw-list-item-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="rw-list-item-name">{set.name}</span>
          {set.isDefault && <span className="rw-visibility-badge rw-visibility-badge--public">Default</span>}
        </div>
        <div className="rw-list-item-actions">
          <span className="rw-list-item-pts">{set.effectivePointsCost} pts</span>
          {isOwner && !set.isDefault && (
            <button className="rw-btn rw-btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={onSetDefault}>
              Set Default
            </button>
          )}
          {isOwner && (
            <button className="rw-btn-icon rw-btn-danger" title="Delete set" onClick={onDelete}>×</button>
          )}
        </div>
      </div>

      {set.entries.length > 0 && (
        <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {set.entries.map((entry: WeaponSetEntryResponse) => (
            <li key={entry.entryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#f4f2ec', borderRadius: 3 }}>
              <span style={{ fontSize: 13 }}>
                {entry.name}
                {entry.weaponTypeName && <span style={{ color: '#6b6050', marginLeft: 6, fontSize: 12 }}>{entry.weaponTypeName}</span>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#6b6050', fontStyle: 'italic' }}>{entry.pointsCost} pts</span>
                {isOwner && (
                  <button className="rw-btn-icon rw-btn-danger" style={{ fontSize: 14 }} title="Remove from set"
                    onClick={() => onRemoveEntry(entry.entryId)}>×</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOwner && factionWeapons.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <select className="rw-input" style={{ flex: 1 }} value={selectedWeaponId} onChange={(e) => setSelectedWeaponId(e.target.value)}>
            <option value="">Add weapon to set…</option>
            {factionWeapons.map((w) => (
              <option key={w.id} value={w.id}>{w.name} ({w.pointsCost} pts)</option>
            ))}
          </select>
          <button className="rw-btn rw-btn-secondary" disabled={!selectedWeaponId}
            onClick={() => { if (selectedWeaponId) { onAddWeapon(selectedWeaponId); setSelectedWeaponId(''); } }}>
            Add
          </button>
        </div>
      )}
    </li>
  );
}
