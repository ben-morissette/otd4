export default function TeamSelector({ teams, team, setTeam }) {
  return (
    <select
      className="border p-2 rounded w-full"
      value={team}
      onChange={(e) => setTeam(e.target.value)}
    >
      <option value="">Select Team</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}