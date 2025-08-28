import { useState, useEffect } from "react";

const SPORTS = ["NFL", "NBA", "NHL"];
const RARITIES = ["General","Common","Uncommon","Rare","Epic","Leg","Mystic","Iconic"];

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams whenever sport changes
  useEffect(() => {
    if (!sport) return;

    const fetchTeams = async () => {
      let url = "";
      if (sport === "NFL") url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      if (sport === "NBA") url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
      if (sport === "NHL") url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";

      const res = await fetch(url);
      const data = await res.json();
      const teamMap = {};
      data.sports[0].leagues[0].teams.forEach(t => {
        teamMap[t.team.abbreviation] = t.team.displayName;
      });
      setTeams(teamMap);
      setTeam(""); // reset selected team
    };

    fetchTeams();
  }, [sport]);

  // Fetch schedule when team + season + rarity selected
  const fetchSchedule = async () => {
    if (!sport || !team || !season) return;

    const apiMap = { NFL: "nfl_schedule", NBA: "nba_schedule", NHL: "nhl_schedule" };
    const res = await fetch(`/api/${apiMap[sport]}?team=${team}&season=${season}&rarity=${rarity}`);
    const data = await res.json();
    setSchedule(data.schedule || []);
    setTotalRax(data.totalRax || 0);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Team Schedule & Rax Viewer</h1>

      <label>Sport:</label>
      <select value={sport} onChange={e => setSport(e.target.value)}>
        <option value="">Select Sport</option>
        {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <br /><br />

      {sport && (
        <>
          <label>Team:</label>
          <select value={team} onChange={e => setTeam(e.target.value)}>
            <option value="">Select Team</option>
            {Object.keys(teams).map(abbr => (
              <option key={abbr} value={abbr}>{teams[abbr]}</option>
            ))}
          </select>

          <br /><br />

          <label>Season:</label>
          <input type="number" value={season} onChange={e => setSeason(e.target.value)} />

          <br /><br />

          <label>Rarity:</label>
          <select value={rarity} onChange={e => setRarity(e.target.value)}>
            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <br /><br />

          <button onClick={fetchSchedule}>Fetch Schedule & Calculate Rax</button>
        </>
      )}

      {schedule.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Total Rax Earned: {totalRax.toFixed(2)}</h2>
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
                  <td>{new Date(g.date).toLocaleString()}</td>
                  <td>{g.matchup}</td>
                  <td>{g.score}</td>
                  <td>{g.W_L}</td>
                  <td>{g.raxEarned.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}