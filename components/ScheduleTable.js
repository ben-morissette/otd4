export default function ScheduleTable({ schedule, totalRax }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div>
      <h2>Total Rax: {totalRax.toFixed(2)}</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Date</th>
            <th>Game</th>
            <th>Type</th>
            <th>Score</th>
            <th>Rax</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((g, i) => (
            <tr key={i}>
              <td>{g.date ? new Date(g.date).toLocaleString() : ""}</td>
              <td>{g.name}</td>
              <td>{g.type}</td>
              <td>{g.score}</td>
              <td>{g.rax.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}