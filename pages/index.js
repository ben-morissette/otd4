import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [teamsList, setTeamsList] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  const RARITY_MULTIPLIERS = {
    General: 1,
    Common: 1.2,
    Uncommon: 1.4,
    Rare: 1.6,
    Epic: 2,
    Leg: 2.5,
    Mystic: 4,
    Iconic: 6
  };

  // Fetch teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch(`/api/teams?sport=${sport}`);
        const data = await res.json();
        setTeamsList(data);
        setTeam(Object.keys(data)[0] || "");
      } catch (err) {
        console.error("Error fetching teams:", err);
        setTeamsList({});
        setTeam("");
      }
    }
    fetchTeams();
  }, [sport]);

  // Fetch schedule
  useEffect(() => {
    if (!team) return;
    async function fetchSchedule() {
      try {
        const res = await fetch(
          `/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`
        );
        const data = await res.json();
        setSchedule(data.schedule || []);
        setTotalRax(data.total_rax || 0);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setSchedule([]);
        setTotalRax(0);
      }
    }
    fetchSchedule();
  }, [sport, team, season, rarity]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Team Schedule Viewer</h1>

      {/* Sport Picker */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Select Sport:{" "}
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="NHL">NHL</option>
            <option value="NFL">NFL</option>
            <option value="NBA">NBA</option>
          </select>
        </label>
      </div>

      {/* Team Picker */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Select Team:{" "}
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            disabled={!teamsList || Object.keys(teamsList).length === 0}
          >
            {teamsList &&
              Object.keys(teamsList).map((abbr) => (
                <option key={abbr} value={abbr}>
                  {teamsList[abbr]}
                </option>
              ))}
          </select>
        </label>
      </div>

      {/* Season Picker */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Season:{" "}
          <select
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value))}
          >
            {Array.from({ length: 20 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={y}>
                {y} - {y + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Rarity Picker */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Rarity:{" "}
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            {Object.keys(RARITY_MULTIPLIERS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Total Rax */}
      <div style={{ marginTop: "20px" }}>
        <strong>Total Rax Earned: {totalRax.toFixed(2)}</strong>
      </div>

      {/* Schedule Table */}
      <div style={{ marginTop: "15px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left"
          }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Score</th>
              <th>Type</th>
              <th>W/L</th>
              <th>Rax Earned</th>
            </tr>
          </thead>
          <tbody>
            {schedule && schedule.length > 0 ? (
              schedule.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.name}</td>
                  <td>{row.Score}</td>
                  <td>{row.type}</td>
                  <td>{row["W/L"]}</td>
                  <td>{row.rax_earned}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Loading schedule...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
