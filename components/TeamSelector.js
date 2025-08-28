export default function TeamSelector({ teams, selectedTeam, onChange }) {
  return (
    <select
      className="border p-2 rounded"
      value={selectedTeam}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Team</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.displayName}
        </option>
      ))}
    </select>
  );
}