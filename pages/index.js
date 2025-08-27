import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [teamAbbr, setTeamAbbr] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
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
    Iconic: 6,
  };

  // Fetch team list whenever the sport changes
  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch(`/api/teams?sport=${sport}`);
      const data = await res.json();
      setTeams(data);
      setTeamAbbr(Object.keys(data)[0] || "");
    };
    fetchTeams();
  }, [sport]);

  // Fetch schedule whenever team, sport, season, or rarity changes
  useEffect(() => {
    if (!teamAbbr) return;

    const fetchSchedule = async () => {
      const res = await fetch(
        `/api/schedule?sport=${sport}&team=${teamAbbr}&season=${season}&rarity=${rarity}`
      );
      const data = await res.json();
      setSchedule(data.schedule);
      setTotalRax(data.totalRax);
    };

    fetchSchedule();
  }, [sport, teamAbbr, season, rarity]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Team: </label>
        <select
          value={teamAbbr}
          onChange={(e) => setTeamAbbr(e.target.value)}
        >
          {Object.keys(teams).map((abbr) => (
            <option key={abbr} value={abbr}>
              {teams[abbr]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Season: </label>
        <input
          type="number"
          value={season}
          min={2000}
          max={2100}
          onChange={(e) => setSeason(parseInt(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Rarity: </label>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <h2>Total RAX Earned: {totalRax.toFixed(2)}</h2>

      <table border="1" cellPadding="5" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Match</th>
            <th>Type</th>
            <th>Score</th>
            <th>W/L</th>
            <th>RAX Earned</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((game, idx) => (
            <tr key={idx}>
              <td>{game.date}</td>
              <td>{game.name}</td>
              <td>{game.type}</td>
              <td>{game.Score}</td>
              <td>{game.WL}</td>
              <td>{game.rax_earned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
