import { useState, useEffect } from "react";
import { getTeams, getSchedule } from "../utils/raxUtil";

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    if (sport) {
      getTeams(sport).then(setTeams).catch(console.error);
    }
  }, [sport]);

  const handleFetchSchedule = async () => {
    if (!team) return;
    const { schedule: sched, totalRax: rax } = await getSchedule(
      sport,
      team,
      season,
      rarity
    );
    setSchedule(sched);
    setTotalRax(rax);
  };

  return (
    <div style={{ padding: "2rem", background: "#1e1e1e", color: "#fff" }}>
      <h1>Team Schedule Viewer</h1>

      <label>Sport:</label>
      <select value={sport} onChange={(e) => setSport(e.target.value)}>
        <option value="NHL">NHL</option>
        <option value="NFL">NFL</option>
        <option value="NBA">NBA</option>
      </select>

      <br />
      <label>Team:</label>
      <select value={team} onChange={(e) => setTeam(e.target.value)}>
        <option value="">Select Team</option>
        {teams.map((t) => (
          <option key={t.abbr} value={t.abbr}>
            {t.displayName}
          </option>
        ))}
      </select>

      <br />
      <label>Season:</label>
      <input
        type="number"
        value={season}
        onChange={(e) => setSeason(parseInt(e.target.value))}
      />

      <br />
      <label>Rarity:</label>
      <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
        <option>General</option>
        <option>Common</option>
        <option>Uncommon</option>
        <option>Rare</option>
        <option>Epic</option>
        <option>Leg</option>
        <option>Mystic</option>
        <option>Iconic</option>
      </select>

      <br />
      <button onClick={handleFetchSchedule}>Fetch Schedule</button>

      <h2>Total Rax Earned: {totalRax}</h2>

      {schedule.length > 0 && (
        <table border="1" style={{ width: "100%", color: "#fff" }}>
          <thead>
            <tr>
              <th>Game</th>
              <th>W/L</th>
              <th>Date</th>
              <th>Matchup</th>
              <th>Score</th>
              <th>Rax Earned</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((g, i) => (
              <tr key={i}>
                <td>{g.game}</td>
                <td>{g.WL}</td>
                <td>{g.date}</td>
                <td>{g.name}</td>
                <td>{g.Score}</td>
                <td>{g.rax_earned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
