export default function SeasonSelector({ seasons, selectedSeason, onChange }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <label style={{ marginRight: '10px' }}>Select Season:</label>
      <select
        value={selectedSeason}
        onChange={(e) => onChange(e.target.value)}
      >
        {seasons.map(season => (
          <option key={season} value={season}>
            {`${season}-${parseInt(season) + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}