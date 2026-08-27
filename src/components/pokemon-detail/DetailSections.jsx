import { Link } from 'react-router-dom';
import { capitalize } from '../../utils/textUtils';

function formatDisplayName(name) {
  return name.split('-').map(capitalize).join(' ');
}

function formatEvolutionCondition(detail) {
  const conditions = [];
  if (detail.min_level) conditions.push(`Level ${detail.min_level}`);
  if (detail.item) conditions.push(`Use ${formatDisplayName(detail.item.name)}`);
  if (detail.held_item) conditions.push(`Hold ${formatDisplayName(detail.held_item.name)}`);
  if (detail.trigger?.name === 'trade') conditions.push('Trade');
  if (detail.min_happiness) conditions.push(`Happiness ${detail.min_happiness}`);
  if (detail.min_affection) conditions.push(`Affection ${detail.min_affection}`);
  if (detail.min_beauty) conditions.push(`Beauty ${detail.min_beauty}`);
  if (detail.time_of_day) conditions.push(formatDisplayName(detail.time_of_day));
  if (detail.known_move) conditions.push(`Know ${formatDisplayName(detail.known_move.name)}`);
  if (detail.known_move_type) {
    conditions.push(`Know a ${formatDisplayName(detail.known_move_type.name)} move`);
  }
  if (detail.location) conditions.push(`At ${formatDisplayName(detail.location.name)}`);
  if (detail.needs_overworld_rain) conditions.push('While raining');
  if (detail.turn_upside_down) conditions.push('Turn device upside down');
  return conditions.length > 0
    ? conditions.join(' · ')
    : formatDisplayName(detail.trigger?.name || 'Special');
}

function EvolutionNode({ node, currentSpecies, returnTo }) {
  const uniqueDetails = node.evolutionDetails.filter(
    (detail, index, details) =>
      details.findIndex(
        (candidate) => formatEvolutionCondition(candidate) === formatEvolutionCondition(detail)
      ) === index
  );

  return (
    <div className="evolution-tree-node">
      {uniqueDetails.length > 0 && (
        <div className="evolution-condition">
          <span aria-hidden="true">↓</span>
          <div className="evolution-options">
            {uniqueDetails.map((detail, index) => (
              <small key={`${formatEvolutionCondition(detail)}-${index}`}>
                {detail.itemSprite && <img src={detail.itemSprite} alt="" />}
                {formatEvolutionCondition(detail)}
              </small>
            ))}
          </div>
        </div>
      )}
      <Link
        className={`evolution-pokemon ${node.name === currentSpecies ? 'current' : ''}`}
        to={`/pokemon/${node.name}`}
        state={{ returnTo }}
        aria-current={node.name === currentSpecies ? 'page' : undefined}
      >
        <img src={node.image} alt="" />
        <strong>{capitalize(node.name)}</strong>
      </Link>
      {node.evolvesTo.length > 0 && (
        <div className="evolution-branches">
          {node.evolvesTo.map((evolution) => (
            <EvolutionNode
              key={evolution.name}
              node={evolution}
              currentSpecies={currentSpecies}
              returnTo={returnTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EffectivenessGroup({ title, entries }) {
  return (
    <div className="effectiveness-group">
      <h4>{title}</h4>
      {entries.length > 0 ? (
        <div className="effectiveness-types">
          {entries.map(({ name, multiplier }) => (
            <span className={`pokemon-type effectiveness-type type-${name}`} key={name}>
              {capitalize(name)} ×{multiplier}
            </span>
          ))}
        </div>
      ) : <p>None</p>}
    </div>
  );
}

export function PokemonBasicData({ pokemon, species, malePercentage, femalePercentage, isGenderless }) {
  return (
    <section className="detail-section" aria-labelledby="basic-data-title">
      <h3 id="basic-data-title">Basic data</h3>
      <dl className="detail-data-grid">
        <div><dt>Height</dt><dd>{pokemon.height / 10} m</dd></div>
        <div><dt>Weight</dt><dd>{pokemon.weight / 10} kg</dd></div>
        <div><dt>Base experience</dt><dd>{pokemon.base_experience ?? 'Unknown'}</dd></div>
        <div>
          <dt>Gender</dt>
          <dd className="gender-symbols" aria-label={isGenderless ? 'Genderless' : [malePercentage > 0 && 'Male', femalePercentage > 0 && 'Female'].filter(Boolean).join(' and ')}>
            {isGenderless ? <span className="gender-neutral" aria-hidden="true">⚲</span> : (
              <>
                {malePercentage > 0 && <span className="gender-male" aria-hidden="true">♂</span>}
                {femalePercentage > 0 && <span className="gender-female" aria-hidden="true">♀</span>}
              </>
            )}
          </dd>
        </div>
        <div><dt>Generation</dt><dd>{formatDisplayName(species.generation.name)}</dd></div>
        <div><dt>Habitat</dt><dd>{species.habitat ? formatDisplayName(species.habitat.name) : 'Unknown'}</dd></div>
        <div><dt>Capture rate</dt><dd>{species.capture_rate} / 255</dd></div>
        <div>
          <dt>Abilities</dt>
          <dd>{pokemon.abilities.map(({ ability, is_hidden: hidden }) => `${formatDisplayName(ability.name)}${hidden ? ' (Hidden)' : ''}`).join(', ')}</dd>
        </div>
      </dl>
    </section>
  );
}

export function PokemonStats({ stats }) {
  return (
    <section className="detail-section" aria-labelledby="stats-title">
      <h3 id="stats-title">Base stats</h3>
      <div className="stats-list">
        {stats.map(({ base_stat: value, stat }) => (
          <div className="stat-row" key={stat.name}>
            <span>{formatDisplayName(stat.name)}</span><strong>{value}</strong>
            <div className="stat-track" aria-hidden="true"><span style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PokemonDefenses({ defenses, loading, error, onRetry }) {
  return (
    <section className="detail-section" aria-labelledby="effectiveness-title">
      <h3 id="effectiveness-title">Type effectiveness</h3>
      {loading ? <p className="evolution-message" role="status">Loading type effectiveness...</p> : error ? (
        <div className="evolution-message" role="alert"><p>{error}</p><button type="button" onClick={onRetry}>Try again</button></div>
      ) : (
        <div className="effectiveness-grid">
          <EffectivenessGroup title="Weaknesses" entries={defenses.filter(({ multiplier }) => multiplier > 1)} />
          <EffectivenessGroup title="Resistances" entries={defenses.filter(({ multiplier }) => multiplier > 0 && multiplier < 1)} />
          <EffectivenessGroup title="Immunities" entries={defenses.filter(({ multiplier }) => multiplier === 0)} />
        </div>
      )}
    </section>
  );
}

function formatSpecialRequirement(requirement) {
  if (requirement.trigger === 'gigantamax-factor') return 'Gigantamax Factor';
  if (requirement.trigger === 'held-item' && requirement.name) return `Hold ${formatDisplayName(requirement.name)}`;
  if (requirement.name) return formatDisplayName(requirement.name);
  return formatDisplayName(requirement.trigger || 'Special condition');
}

export function PokemonEvolutions({ chain, specialForms, currentSpecies, returnTo, loading, error, onRetry }) {
  return (
    <section className="detail-section" aria-labelledby="evolution-title">
      <h3 id="evolution-title">Evolution chain</h3>
      {loading ? <p className="evolution-message" role="status">Loading evolution chain...</p> : error ? (
        <div className="evolution-message" role="alert"><p>{error}</p><button type="button" onClick={onRetry}>Try again</button></div>
      ) : chain ? (
        <>
          <div className="evolution-tree" tabIndex="0" aria-label="Evolution chain">
            <EvolutionNode node={chain} currentSpecies={currentSpecies} returnTo={returnTo} />
          </div>
          {specialForms.length > 0 && (
            <div className="special-forms">
              <h4>Special forms</h4>
              <div className="special-forms-grid">
                {specialForms.map((form) => (
                  <Link className="special-form-card" to={`/pokemon/${form.name}`} state={{ returnTo }} key={form.name}>
                    <small>{form.category}</small><img src={form.image} alt="" /><strong>{formatDisplayName(form.name)}</strong>
                    {form.requirements.length > 0 && <div className="special-form-requirements">{form.requirements.map((requirement) => (
                      <span key={`${requirement.trigger}-${requirement.name || 'condition'}`}>
                        {requirement.sprite && <img src={requirement.sprite} alt="" />}{formatSpecialRequirement(requirement)}
                      </span>
                    ))}</div>}
                    <div className="special-form-types">{form.types.map((type) => <span className={`pokemon-type effectiveness-type type-${type}`} key={type}>{capitalize(type)}</span>)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
