export default function SportSelector({ selectedSport, onChangeSport }) {
  const sports = [
    { label: "NHL", value: "hockey/nhl" },
    { label: "NFL", value: "football/nfl" },
    { label: "NBA", value: "basketball/nba" },
  ];

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>Sport: </label>
      <select value={selectedSport} onChange={(e) => onChangeSport(e.target.value)}>
        <option value="">--Select Sport--</option>
        {sports.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}