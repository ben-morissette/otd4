export default function TeamSelector({ teams, selectedTeam, onChangeTeam }) {
  return (
    <div style={{ margin: "1rem 0" }}>
      <label>Select Team: </label>
      <select
        value={selectedTeam}
        onChange={(e) => onChangeTeam(e.target.value)}
      >
        <option value="">--Choose Team--</option>
        {teams.map((t) => (
          <option key={t.abbreviation} value={t.abbreviation}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}export default function TeamSelector({ teams, selectedTeam, onChangeTeam }) {
  return (
    <div style={{ margin: "1rem 0" }}>
      <label>Select Team: </label>
      <select
        value={selectedTeam}
        onChange={(e) => onChangeTeam(e.target.value)}
      >
        <option value="">--Choose Team--</option>
        {teams.map((t) => (
          <option key={t.abbreviation} value={t.abbreviation}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}