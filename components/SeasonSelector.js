export default function SeasonSelector({ seasons, selectedSeason, onChange }) {
  return (
    <select
      className="border p-2 rounded"
      value={selectedSeason}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Season</option>
      {seasons.map((season) => (
        <option key={season} value={season}>
          {season}-{parseInt(season) + 1}
        </option>
      ))}
    </select>
  );
}