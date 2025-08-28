export default function TeamSelector({ teams, onSelect }) {
  return (
    <select
      className="border p-2 w-full"
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select Team</option>
      {teams.map((team, idx) => (
        <option key={idx} value={team.id}>{team.displayName}</option>
      ))}
    </select>
  );
}