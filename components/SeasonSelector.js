export default function SeasonSelector({ seasons, onSelect }) {
  return (
    <select
      className="border p-2 w-full"
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select Season</option>
      {seasons.map((s, idx) => (
        <option key={idx} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}