import { useEffect, useState } from "react";
import { getTeams, getSchedule, calculateRaxForSchedule } from "../lib/api";

const SPORTS = [
  { label: "MLB", value: "baseball/mlb" },
  { label: "NHL", value: "hockey/nhl" },
  { label: "NFL", value: "football/nfl" },
  { label: "CFB", value: "football/college-football" },
  { label: "NBA", value: "basketball/nba" },
  { label: "CBB", value: "basketball/college-basketball" },
  { label: "WNBA", value: "basketball/wnba" }
];

export default function Home() {
  const [sport, setSport] = useState(SPORTS[0].value);
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [year, setYear] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    getTeams(sport).then(t => setTeams(t));
  }, [sport]);

  const handleFetchSchedule = async () => {
    if (!team) return;
    const sched = await getSchedule(sport, team, year);
    const { rows, totalRax } = calculateRaxForSchedule(sport, teams[team], sched, rarity);
    setSchedule(rows);
    setTotalRax(totalRax);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Team Rax Viewer</h1>

      <div>
        <label>Sport: </label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div>
        <label>Team: </label>
        <select value={team} onChange={e => setTeam(e.target.value)}>
          <option value="">Select a Team</option>
          {Object.keys(teams).map(abbr => <option key={abbr} value={abbr}>{teams[abbr]}</option>)}
        </select>
      </div>

      <div>
        <label>Year: </label>
        <input type="number" value={year} min="2000" max="2100" onChange={e => setYear(parseInt(e.target.value))} />
      </div>

      <div>
        <label>Rarity: </label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <button onClick={handleFetchSchedule} style={{ margin: "1rem 0" }}>Fetch Schedule</button>

      <h2>Total Rax: {totalRax}</h2>

      {schedule.length > 0 && (
        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Matchup</th>
              <th>Home</th>
              <th>Away</th>
              <th>Winner</th>
              <th>Loser</th>
              <th>Margin</th>
              <th>Rax</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, idx) => (
              <tr key={idx}>
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{row.matchup}</td>
                <td>{row.homeScore}</td>
                <td>{row.awayScore}</td>
                <td>{row.winner}</td>
                <td>{row.loser}</td>
                <td>{row.margin}</td>
                <td>{row.rax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
