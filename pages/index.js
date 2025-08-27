import { useEffect, useState } from "react";
import axios from "axios";

const SPORTS = [
  { name: "NHL", sport: "hockey", league: "nhl" },
  { name: "NFL", sport: "football", league: "nfl" },
  { name: "NBA", sport: "basketball", league: "nba" },
];

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

// Rax calculation rules
const calculateRax = (sport, margin, isPlayoff = false) => {
  switch (sport) {
    case "NHL":
      return isPlayoff ? 20 + margin * 20 : 12 * margin;
    case "NFL":
      return 100 + margin * 2; // simple version for wins
    case "NBA":
      return isPlayoff ? 30 + margin * 2.5 : 2.5 * margin;
    default:
      return margin;
  }
};

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [rarity, setRarity] = useState("General");
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams whenever sport changes
  useEffect(() => {
    const selected = SPORTS.find((s) => s.name === sport);
    if (!selected) return;

    axios
      .get(
        `https://site.api.espn.com/apis/site/v2/sports/${selected.sport}/${selected.league}/teams`
      )
      .then((res) => {
        const data = res.data;
        const teamsObj = {};
        data.sports[0].leagues[0].teams.forEach((t) => {
          teamsObj[t.team.abbreviation] = t.team.displayName;
        });
        setTeams(teamsObj);
        setTeam(Object.keys(teamsObj)[0] || "");
      })
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, [sport]);

  // Fetch schedule whenever team or sport changes
  useEffect(() => {
    if (!team) return;
    const selected = SPORTS.find((s) => s.name === sport);
    const url = `https://site.api.espn.com/apis/site/v2/sports/${selected.sport}/${selected.league}/teams/${team}/schedule`;

    axios
      .get(url)
      .then((res) => {
        const events = res.data.events || [];
        let total = 0;
        const scheduleData = events.map((e) => {
          const home = e.competitions[0].competitors.find(
            (c) => c.homeAway === "home"
          );
          const away = e.competitions[0].competitors.find(
            (c) => c.homeAway === "away"
          );
          const homeScore = parseInt(home.score || 0);
          const awayScore = parseInt(away.score || 0);
          const margin = Math.abs(homeScore - awayScore);
          let rax = 0;

          if (homeScore !== awayScore) {
            const winner = homeScore > awayScore ? home : away;
            if (winner.team.abbreviation === team) {
              rax = calculateRax(sport, margin);
            }
          }

          total += rax;
          return {
            date: e.date,
            matchup: e.name,
            homeScore,
            awayScore,
            margin,
            rax,
          };
        });
        setSchedule(scheduleData);
        setTotalRax(total);
      })
      .catch((err) => console.error("Failed to fetch schedule:", err));
  }, [team, sport, rarity]);

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#f0f0f0",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Team Schedule & Rax Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Sport: </label>
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          style={{ marginRight: "1rem" }}
        >
          {SPORTS.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <label>Team: </label>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          style={{ marginRight: "1rem" }}
        >
          {Object.keys(teams).map((abbr) => (
            <option key={abbr} value={abbr}>
              {teams[abbr]}
            </option>
          ))}
        </select>

        <label>Rarity: </label>
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
        >
          {Object.keys(RARITY_MULTIPLIERS).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <h2>Total Rax: {totalRax}</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#1e1e1e",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #444", padding: "0.5rem" }}>
              Date
            </th>
            <th style={{ border: "1px solid #444", padding: "0.5rem" }}>
              Matchup
            </th>
            <th style={{ border: "1px solid #444", padding: "0.5rem" }}>
              Home
            </th>
            <th style={{ border: "1px solid #444", padding: "0.5rem" }}>
              Away
            </th>
            <th style={{ border: "1px solid #444", padding: "0.5rem" }}>
              Margin
            </th>
            <th style={{ border: "1px solid #444", padding: "0.5rem" }}>
              Rax
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((game, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {new Date(game.date).toLocaleString()}
              </td>
              <td style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {game.matchup}
              </td>
              <td style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {game.homeScore}
              </td>
              <td style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {game.awayScore}
              </td>
              <td style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {game.margin}
              </td>
              <td style={{ border: "1px solid #444", padding: "0.5rem" }}>
                {game.rax}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
