import { formatDisplayName } from './detailFormatters';

function PokemonBasicData({ pokemon, species, malePercentage, femalePercentage, isGenderless }) {
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

export default PokemonBasicData;
