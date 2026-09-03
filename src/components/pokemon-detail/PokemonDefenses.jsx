import { capitalize } from '../../utils/textUtils';

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

function PokemonDefenses({ defenses, loading, error, onRetry }) {
  return (
    <section className="detail-section" aria-labelledby="effectiveness-title">
      <h3 id="effectiveness-title">Type effectiveness</h3>
      {loading ? (
        <p className="evolution-message" role="status">Loading type effectiveness...</p>
      ) : error ? (
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

export default PokemonDefenses;
