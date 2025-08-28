export default function TeamSelector({ teams, selectedTeam, onChangeTeam }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>Team: </label>
      <select value={selectedTeam} onChange={(e) => onChangeTeam(e.target.value)}>
        <option value="">--Select Team--</option>
        {teams.map((t) => (
          <option key={t.abbreviation} value={t.abbreviation}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}