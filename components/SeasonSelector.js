export default function SeasonSelector({ selectedSeason, onChange }) {
  const currentYear = new Date().getFullYear();
  const seasons = [];
  for (let year = currentYear; year >= 2020; year--) {
    seasons.push(year);
  }

  return (
    <select
      className="border p-2 rounded w-full mb-4"
      value={selectedSeason}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Season</option>
      {seasons.map((year) => (
        <option key={year} value={year}>
          {year} - {year + 1}
        </option>
      ))}
    </select>
  );
}