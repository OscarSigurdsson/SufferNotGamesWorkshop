import type { UnitDatasheet, WeaponProfile } from '../../types/datasheet';
import './UnitStatblock.css';

interface Props {
  datasheet: UnitDatasheet;
}

function WeaponTable({ weapons, skillLabel }: { weapons: WeaponProfile[]; skillLabel: 'BS' | 'WS' }) {
  return (
    <table className="weapon-table">
      <thead>
        <tr>
          <th>Weapon</th>
          <th>Range</th>
          <th>A</th>
          <th>{skillLabel}</th>
          <th>S</th>
          <th>AP</th>
          <th>D</th>
          <th>Abilities</th>
        </tr>
      </thead>
      <tbody>
        {weapons.map((w) => (
          <tr key={w.name}>
            <td className="weapon-name">{w.name}</td>
            <td>{w.range}</td>
            <td>{w.attacks}</td>
            <td>{w.skill}</td>
            <td>{w.strength}</td>
            <td>{w.armorPenetration === 0 ? '0' : `-${w.armorPenetration}`}</td>
            <td>{w.damage}</td>
            <td className="weapon-abilities">{w.abilities.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function UnitStatblock({ datasheet }: Props) {
  const { stats } = datasheet;

  return (
    <div className="statblock">
      <div className="statblock-header">
        <h2 className="statblock-name">{datasheet.name}</h2>
        <span className="statblock-faction">{datasheet.faction}</span>
      </div>

      <div className="statblock-stats">
        <div className="stat-cell">
          <span className="stat-label">M</span>
          <span className="stat-value">{stats.movement}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">T</span>
          <span className="stat-value">{stats.toughness}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">SV</span>
          <span className="stat-value">{stats.save}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">W</span>
          <span className="stat-value">{stats.wounds}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">LD</span>
          <span className="stat-value">{stats.leadership}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">OC</span>
          <span className="stat-value">{stats.objectiveControl}</span>
        </div>
      </div>

      {datasheet.rangedWeapons.length > 0 && (
        <div className="statblock-section">
          <div className="statblock-section-title">Ranged Weapons</div>
          <WeaponTable weapons={datasheet.rangedWeapons} skillLabel="BS" />
        </div>
      )}

      {datasheet.meleeWeapons.length > 0 && (
        <div className="statblock-section">
          <div className="statblock-section-title">Melee Weapons</div>
          <WeaponTable weapons={datasheet.meleeWeapons} skillLabel="WS" />
        </div>
      )}

      {datasheet.abilities.length > 0 && (
        <div className="statblock-section">
          <div className="statblock-section-title">Abilities</div>
          <div className="abilities-list">
            {datasheet.abilities.map((ability) => (
              <div key={ability.name} className="ability">
                <span className="ability-name">
                  {ability.name}
                  {ability.isCore && <span className="core-badge">Core</span>}
                </span>
                <span className="ability-description">{ability.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="statblock-keywords">
        <span className="keywords-label">Faction:</span>
        <span className="keywords-value">{datasheet.factionKeywords.join(', ')}</span>
      </div>
      <div className="statblock-keywords">
        <span className="keywords-label">Keywords:</span>
        <span className="keywords-value">{datasheet.keywords.join(', ')}</span>
      </div>

      <div className="statblock-footer">
        <span>{datasheet.modelCount}</span>
        <span>{datasheet.pointsCost} pts</span>
      </div>
    </div>
  );
}
