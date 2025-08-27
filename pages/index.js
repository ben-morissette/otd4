import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("");
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  const rarities = ["General", "Common", "Uncommon", "Rare", "Epic", "Leg", "Mystic", "Iconic"];

  useEffect(() => {
    if (!sport) return;
    fetch(`/api/teams?sport=${sport}`)
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(console.error);
  }, [sport]);

  useEffect(() => {
    if (!sport || !team || !season) return;
    fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`)
      .then(res => res.json())
      .then(data => {
        setSchedule(data.schedule || []);
        setTotalRax(data.totalRax || 0);
      })
      .catch(console.error);
  }, [sport, team, season, rarity]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Team Schedule Viewer</h1>

      <div>
        <label>Sport:</label>
        <select value={sport} onChange={e => { setSport(e.target.value); setTeam(""); }}>
          <option value="">Select Sport</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      {sport && (
        <div>
          <label>Team:</label>
          <select value={team} onChange={e => setTeam(e.target.value)}>
            <option value="">Select Team</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Season:</label>
        <input type="number" value={season} onChange={e => setSeason(e.target.value)} placeholder="e.g. 2024"/>
      </div>

      <div>
        <label>Rarity:</label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {rarities.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <h2>Total Rax: {totalRax.toFixed(2)}</h2>

      <table border="1" cellPadding="5">
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
          {schedule.map((g, i) => (
            <tr key={i}>
              <td>{g.date}</td>
              <td>{g.matchup}</td>
              <td>{g.score}</td>
              <td>{g.W_L}</td>
              <td>{g.rax_earned.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
