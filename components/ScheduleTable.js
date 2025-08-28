export default function ScheduleTable({ schedule }) {
  if (!schedule.length) {
    return <p>No games available.</p>;
  }

  return (
    <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
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
        {schedule.map((game) => (
          <tr key={game.id}>
            <td className="border px-4 py-2">{game.date}</td>
            <td className="border px-4 py-2">{game.matchup}</td>
            <td className="border px-4 py-2">{game.score}</td>
            <td className="border px-4 py-2">{game.status}</td>
            <td className="border px-4 py-2">{game.rax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}