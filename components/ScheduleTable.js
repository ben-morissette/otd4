export default function ScheduleTable({ schedule }) {
  return (
    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Matchup</th>
          <th>Score</th>
          <th>Winner</th>
          <th>Margin</th>
          <th>Rax</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((game, idx) => (
          <tr key={idx}>
            <td>{game.date}</td>
            <td>{game.matchup}</td>
            <td>{game.homeScore} - {game.awayScore}</td>
            <td>{game.winner}</td>
            <td>{game.margin}</td>
            <td>{game.rax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}