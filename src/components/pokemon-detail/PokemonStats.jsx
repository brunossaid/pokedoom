import { formatDisplayName } from './detailFormatters';

function PokemonStats({ stats }) {
  return (
    <section className="detail-section" aria-labelledby="stats-title">
      <h3 id="stats-title">Base stats</h3>
      <div className="stats-list">
        {stats.map(({ base_stat: value, stat }) => (
          <div className="stat-row" key={stat.name}>
            <span>{formatDisplayName(stat.name)}</span>
            <strong>{value}</strong>
            <div className="stat-track" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PokemonStats;
