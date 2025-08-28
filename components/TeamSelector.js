export default function TeamSelector({ teams, selectedTeam, onChange }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <label style={{ marginRight: '10px' }}>Select Team:</label>
      <select
        value={selectedTeam}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Choose a Team --</option>
        {teams.map(team => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
    </div>
  );
}