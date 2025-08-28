export default function ScheduleTable({ schedule }) {
  if (!schedule.length) {
    return <p className="text-center mt-6">No schedule loaded yet.</p>;
  }

  return (
    <table className="w-full border mt-6 text-left">
      <thead>
        <tr>
          <th className="border px-4 py-2">Date</th>
          <th className="border px-4 py-2">Matchup</th>
          <th className="border px-4 py-2">Score</th>
          <th className="border px-4 py-2">Status</th>
          <th className="border px-4 py-2">RAX</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((game, index) => (
          <tr key={index}>
            <td className="border px-4 py-2">{new Date(game.date).toLocaleString()}</td>
            <td className="border px-4 py-2">{game.name}</td>
            <td className="border px-4 py-2">
              {game.score.map((s) => `${s.team}: ${s.score}`).join(" | ")}
            </td>
            <td className="border px-4 py-2">{game.status}</td>
            <td className="border px-4 py-2">{game.rax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}