export default function ScheduleTable({ schedule }) {
  if (!schedule || schedule.length === 0) return <p>No games available.</p>;

  return (
    <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border p-2">Date</th>
          <th className="border p-2">Matchup</th>
          <th className="border p-2">Score</th>
          <th className="border p-2">Status</th>
          <th className="border p-2">RAX</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((game, index) => {
          const home = game.competitions[0].competitors.find(c => c.homeAway === 'home');
          const away = game.competitions[0].competitors.find(c => c.homeAway === 'away');
          const homeTeam = home?.team?.displayName || 'Home';
          const awayTeam = away?.team?.displayName || 'Away';
          const homeScore = home?.score || 'NaN';
          const awayScore = away?.score || 'NaN';
          const status = game.status?.type?.description || 'Scheduled';

          return (
            <tr key={index}>
              <td className="border p-2">{game.date}</td>
              <td className="border p-2">{`${awayTeam} @ ${homeTeam}`}</td>
              <td className="border p-2">{`${awayScore} - ${homeScore}`}</td>
              <td className="border p-2">{status}</td>
              <td className="border p-2">0.00</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}