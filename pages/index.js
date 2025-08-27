import { useEffect, useState } from "react";

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const RARITY_OPTIONS = [
    "General",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Leg",
    "Mystic",
    "Iconic"
  ];

  // Fetch teams whenever sport changes
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/teams?sport=${sport}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setTeams({});
          setTeam("");
        } else {
          setTeams(data.teams);
          setTeam(Object.keys(data.teams)[0] || "");
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load teams");
      })
      .finally(() => setLoading(false));
  }, [sport]);

  // Fetch schedule when team, season, or rarity changes
  useEffect(() => {
    if (!team) return;
    setLoading(true);
    setError("");
    fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setSchedule([]);
          setTotalRax(0);
        } else {
          setSchedule(data.schedule);
          setTotalRax(data.totalRax);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load schedule");
        setSchedule([]);
        setTotalRax(0);
      })
      .finally(() => setLoading(false));
  }, [sport, team, season, rarity]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Sport: </label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Team: </label>
        <select value={team} onChange={e => setTeam(e.target.value)}>
          {Object.keys(teams).map(abbr => (
            <option key={abbr} value={abbr}>{teams[abbr]}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Season: </label>
        <input
          type="number"
          value={season}
          min={2000}
          max={2100}
          onChange={e => setSeason(Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Rarity: </label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {RARITY_OPTIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && schedule.length > 0 && (
        <>
          <h2>Total Rax Earned: {totalRax.toFixed(2)}</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Game</th>
                <th>Type</th>
                <th>Score</th>
                <th>W/L</th>
                <th>Rax Earned</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((g, idx) => (
                <tr key={idx}>
                  <td>{g.date}</td>
                  <td>{g.name}</td>
                  <td>{g.type}</td>
                  <td>{g.Score}</td>
                  <td>{g["W/L"]}</td>
                  <td>{g.rax_earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
