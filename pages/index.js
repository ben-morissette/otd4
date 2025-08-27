import { useState, useEffect } from "react";

const SPORTS = ["NHL", "NFL", "NBA"];
const RARITIES = [
  "General",
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Leg",
  "Mystic",
  "Iconic",
];

const TEAMS = {
  NHL: {},
  NFL: {},
  NBA: {},
};

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch teams on sport change
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`/api/teams?sport=${sport}`);
        const data = await res.json();
        TEAMS[sport] = data.teams || {};
        const keys = Object.keys(TEAMS[sport]);
        setTeams(keys);
        setTeam(keys[0] || "");
      } catch (err) {
        console.error("Failed to fetch teams", err);
        setTeams([]);
        setTeam("");
      }
    };
    fetchTeams();
  }, [sport]);

  // Fetch schedule
  const fetchSchedule = async () => {
    if (!team) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`
      );
      const data = await res.json();
      setSchedule(data.schedule || []);
      setTotalRax(data.totalRax || 0);
    } catch (err) {
      console.error("Failed to fetch schedule", err);
      setSchedule([]);
      setTotalRax(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [team, sport, season, rarity]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Sport:{" "}
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Team:{" "}
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            {teams.map((t) => (
              <option key={t} value={t}>
                {TEAMS[sport][t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Season:{" "}
          <input
            type="number"
            value={season}
            min={2000}
            max={2100}
            onChange={(e) => setSeason(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Rarity:{" "}
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={fetchSchedule} disabled={loading}>
        {loading ? "Loading..." : "Fetch Schedule"}
      </button>

      <h2>Total Rax Earned: {totalRax.toFixed(2)}</h2>

      {schedule.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Date
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Game
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Type
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Score
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                W/L
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Rax Earned
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((game, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {game.date || ""}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {game.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {game.type}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {game.Score || ""}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {game.WL || ""}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {game.rax_earned?.toFixed(2) || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
