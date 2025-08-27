export default function ScheduleTable({ schedule }) {
  if (!schedule || schedule.length === 0) return <div>No schedule found.</div>;

  return (
    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Opponent</th>
          <th>Location</th>
          <th>Rax</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((g, i) => (
          <tr key={i}>
            <td>{g.date}</td>
            <td>{g.opponent}</td>
            <td>{g.location}</td>
            <td>{g.rax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
