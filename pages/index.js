import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("");
  const [rarity, setRarity] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  const RARITY_OPTIONS = [
    "General",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Leg",
    "Mystic",
    "Iconic",
  ];

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sport) return;

    fetch(`/api/teams?sport=${sport}`)
      .then((res) => res.json())
      .then((data) => {
        setTeams(data || {});
        setTeam(""); // reset team selection
      })
      .catch(console.error);
  }, [sport]);

  // Fetch schedule when all selections are made
  useEffect(() => {
    if (!sport || !team || !season || !rarity) return;

    fetch(
      `/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`
    )
      .then((res) => res.json())
      .then((data) => {
        setScheduleData(data.schedule || []);
        setTotalRax(data.totalRax || 0);
      })
      .catch(console.error);
  }, [sport, team, season, rarity]);

  const formatSeason = (yr) => `${yr}–${parseInt(yr) + 1}`;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Team Schedule Viewer</h1>

      {/* Sport selection */}
      <div>
        <label>Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">Select Sport</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      {/* Team selection */}
      {sport && (
        <div style={{ marginTop: "1rem" }}>
          <label>Team: </label>
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">Select Team</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Season */}
      {sport && (
        <div style={{ marginTop: "1rem" }}>
          <label>Season Start Year: </label>
          <input
            type="number"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            min={2000}
            max={2100}
          />
          {season && <span> ({formatSeason(season)})</span>}
        </div>
      )}

      {/* Rarity */}
      {sport && (
        <div style={{ marginTop: "1rem" }}>
          <label>Rarity: </label>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            <option value="">Select Rarity</option>
            {RARITY_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule table */}
      {scheduleData.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Total RAX: {totalRax.toFixed(2)}</h2>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Game</th>
                <th>Score</th>
                <th>Winner</th>
                <th>RAX</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((game, i) => (
                <tr key={i}>
                  <td>{new Date(game.date).toLocaleString()}</td>
                  <td>
                    {game.away} at {game.home}
                  </td>
                  <td>{game.Score}</td>
                  <td>{game.winner}</td>
                  <td>{game.rax.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
