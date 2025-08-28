export default function TeamSelector({ teams, team, setTeam }) {
  return (
    <div>
      <label>Team: </label>
      <select value={team} onChange={e => setTeam(e.target.value)}>
        <option value="">Select Team</option>
        {Object.entries(teams).map(([abbr, name]) => (
          <option key={abbr} value={abbr}>{name}</option>
        ))}
      </select>
    </div>
  );
}