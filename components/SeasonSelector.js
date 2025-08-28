export default function SeasonSelector({ season, setSeason }) {
  const currentYear = new Date().getFullYear();
  const seasons = [];
  for (let i = 0; i < 5; i++) {
    const startYear = currentYear - i;
    const displayLabel = `${startYear}-${startYear + 1}`;
    seasons.push({ value: startYear, label: displayLabel });
  }

  return (
    <select
      className="border p-2 rounded w-full"
      value={season}
      onChange={(e) => setSeason(e.target.value)}
    >
      <option value="">Select Season</option>
      {seasons.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}