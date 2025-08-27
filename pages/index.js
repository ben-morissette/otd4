import { useEffect, useState } from "react";

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teamAbbr, setTeamAbbr] = useState("");
  const [teams, setTeams] = useState({});
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    async function fetchTeams() {
      const res = await fetch(`/api/teams?sport=${sport}`);
      const data = await res.json();
      setTeams(data);
      setTeamAbbr(Object.keys(data)[0]);
    }
    fetchTeams();
  }, [sport]);

  const fetchSchedule = async () => {
    const res = await fetch(`/api/schedule?sport=${sport}&teamAbbr=${teamAbbr}&season=${season}&rarity=${rarity}`);
    const data = await res.json();
    setSchedule(data.schedule);
    setTotalRax(data.totalRax);
  };

  const getRowStyle = (W_L) => {
    if (W_L === "W") return { backgroundColor: "#c6f6d5" }; // green for wins
    if (W_L === "L") return { backgroundColor: "#feb2b2" }; // red for losses
    return {};
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Sport: </label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option>NHL</option>
          <option>NFL</option>
          <option>NBA</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Team: </label>
        <select value={teamAbbr} onChange={e => setTeamAbbr(e.target.value)}>
          {Object.keys(teams).map(abbr => (
            <option key={abbr} value={abbr}>{teams[abbr]}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Season: </label>
        <input type="number" value={season} min={2000} max={2100} onChange={e => setSeason(e.target.value)} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Rarity: </label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {["General","Common","Uncommon","Rare","Epic","Leg","Mystic","Iconic"].map(r => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <button onClick={fetchSchedule} style={{ marginBottom: 20 }}>Get Schedule</button>

      <h2>Total RAX: {totalRax.toFixed(2)}</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: 5 }}>Date</th>
            <th style={{ border: "1px solid black", padding: 5 }}>Name</th>
            <th style={{ border: "1px solid black", padding: 5 }}>Type</th>
            <th style={{ border: "1px solid black", padding: 5 }}>Score</th>
            <th style={{ border: "1px solid black", padding: 5 }}>W/L</th>
            <th style={{ border: "1px solid black", padding: 5 }}>Margin</th>
            <th style={{ border: "1px solid black", padding: 5 }}>Base RAX</th>
            <th style={{ border: "1px solid black", padding: 5 }}>RAX Earned</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((game, idx) => (
            <tr key={idx} style={getRowStyle(game.W_L)}>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.date}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.name}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.type}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.Score}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.W_L}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.margin}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.baseRax}</td>
              <td style={{ border: "1px solid black", padding: 5 }}>{game.rax.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
