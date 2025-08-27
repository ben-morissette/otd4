import { useState, useEffect } from "react";

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
    "General", "Common", "Uncommon", "Rare", "Epic", "Leg", "Mystic", "Iconic"
  ];

  // Load teams when sport changes
  useEffect(() => {
    if (!sport) return;
    setLoading(true);
    setError("");
    fetch(`/api/teams?sport=${sport}`)
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams || {});
        setTeam(Object.keys(data.teams || {})[0] || "");
      })
      .catch(err => setError("Failed to load teams"))
      .finally(() => setLoading(false));
  }, [sport]);

  // Load schedule when team, season, or rarity changes
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
          setSchedule(data.schedule || []);
          setTotalRax(data.totalRax || 0);
        }
      })
      .catch(err => setError("Failed to load schedule"))
      .finally(() => setLoading(false));
  }, [sport, team, season, rarity]);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Team Schedule Viewer</h1>

      <label>
        Select Sport:
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </label>
      <br /><br />

      <label>
        Select Team:
        <select value={team} onChange={e => setTeam(e.target.value)}>
          {Object.keys(teams).map(abbr => (
            <option key={abbr} value={abbr}>
              {teams[abbr]}
            </option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        Season:
        <input
          type="number"
          value={season}
          min={2000}
          max={2100}
          onChange={e => setSeason(parseInt(e.target.value))}
        />
        {" "}({season} - {season + 1})
      </label>
      <br /><br />

      <label>
        Rarity:
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {RARITY_OPTIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <br /><br />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && schedule.length > 0 && (
        <div>
          <h2>Total Rax Earned: {totalRax.toFixed(2)}</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Score</th>
                <th>Type</th>
                <th>W/L</th>
                <th>Rax Earned</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((game, idx) => (
                <tr key={idx}>
                  <td>{new Date(game.date).toLocaleString()}</td>
                  <td>{game.name}</td>
                  <td>{game.Score}</td>
                  <td>{game.type}</td>
                  <td>{game["W/L"]}</td>
                  <td>{game.rax_earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
