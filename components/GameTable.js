export default function GameTable({ games }) {
  if (!games.length) {
    return <p>No games available.</p>;
  }

  return (
    <table border="1" cellPadding="10" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Matchup</th>
          <th>Score</th>
          <th>Status</th>
          <th>RAX</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game, index) => (
          <tr key={index}>
            <td>{new Date(game.date).toLocaleString()}</td>
            <td>{game.name}</td>
            <td>{game.awayTeam} {game.awayScore} - {game.homeTeam} {game.homeScore}</td>
            <td>{game.status}</td>
            <td>{game.rax.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}