// components/SeasonSelector.js
export default function SeasonSelector({ selectedSeason, onChangeSeason }) {
  const seasons = Array.from({ length: 10 }, (_, i) => 2024 - i); // last 10 seasons
  return (
    <div style={{ margin: "1rem 0" }}>
      <label>Select Season: </label>
      <select
        value={selectedSeason}
        onChange={(e) => onChangeSeason(e.target.value)}
      >
        <option value="">--Choose Season--</option>
        {seasons.map((season) => (
          <option key={season} value={season}>
            {season}-{parseInt(season) + 1}
          </option>
        ))}
      </select>
    </div>
  );
}