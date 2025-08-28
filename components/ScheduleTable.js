export default function ScheduleTable({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return <p className="text-gray-500">No games found.</p>;
  }

  return (
    <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border p-2">Date</th>
          <th className="border p-2">Matchup</th>
          <th className="border p-2">Score</th>
          <th className="border p-2">Result</th>
          <th className="border p-2">RAX</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((game, idx) => (
          <tr key={idx}>
            <td className="border p-2">{game.date}</td>
            <td className="border p-2">{game.matchup}</td>
            <td className="border p-2">{game.score}</td>
            <td className="border p-2">{game.result}</td>
            <td className="border p-2">{game.rax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}