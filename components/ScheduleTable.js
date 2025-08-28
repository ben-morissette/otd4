import React from "react";

export default function ScheduleTable({ schedule, totalRax }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div>
      <h3>Total Rax Earned: {totalRax}</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Matchup</th>
            <th>Score</th>
            <th>W/L</th>
            <th>Rax Earned</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((g, idx) => (
            <tr key={idx}>
              <td>{new Date(g.date).toLocaleString()}</td>
              <td>{g.matchup}</td>
              <td>{g.score}</td>
              <td>{g.W_L}</td>
              <td>{g.raxEarned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}