import { useState, useEffect } from "react";

// Rarity multipliers
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

// Supported sports
const SPORTS = [
  { name: "NHL", sport: "hockey", league: "nhl" },
  { name: "NFL", sport: "football", league: "nfl" },
  { name: "NBA", sport: "basketball", league: "nba" },
];

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams whenever sport changes
  useEffect(() => {
    const selected = SPORTS.find((s) => s.name === sport);
    if (!selected) return;

    fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${selected.sport}/${selected.league}/teams`
    )
      .then((res) => res.json())
      .then((data) => {
        const teamsObj = {};
        data.sports[0].leagues[0].teams.forEach((t) => {
          teamsObj[t.team.abbreviation] = t.team.displayName;
        });
        setTeams(teamsObj);
        setTeam(Object.keys(teamsObj)[0] || "");
      });
  }, [sport]);

  // Fetch schedule when team, season, or rarity changes
  useEffect(() => {
    if (!team) return;
    const selected = SPORTS.find((s) => s.name === sport);
    const url = `https://site.api.espn.com/apis/site/v2/sports/${selected.sport}/${selected.league}/teams/${team}/schedule?season=${season}&seasontype=2`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const events = data.events || [];
        const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
        let total = 0;
        const sched = events.map((e, i) => {
          const home = e.competitions[0].competitors.find((c) => c.homeAway === "home");
          const away = e.competitions[0].competitors.find((c) => c.homeAway === "away");
          const homeScore = parseInt(home.score || 0);
          const awayScore = parseInt(away.score || 0);
          const winner = homeScore > awayScore ? home.team.displayName : away.team.displayName;
          const margin = Math.abs(homeScore - awayScore);
          let baseRax = 0;

          // Rax rules (simplified example, adjust per sport rules)
          if (winner === home.team.displayName && home.team.abbreviation === team) {
            baseRax = 12 * margin;
          } else if (winner === away.team.displayName && away.team.abbreviation === team) {
            baseRax = 12 * margin;
          }

          total += baseRax * rarityMultiplier;

          return {
            game: `Game ${i + 1}`,
            matchup: `${away.team.displayName} @ ${home.team.displayName}`,
            score: `${awayScore} - ${homeScore}`,
            margin,
            rax: baseRax * rarityMultiplier,
          };
        });
        setSchedule(sched);
        setTotalRax(total);
      });
  }, [team, season, rarity, sport]);

  return (
    <div className="container">
      <h1>Team Schedule Viewer</h1>
      <div className="controls">
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          {SPORTS.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          {Object.keys(teams).map((abbr) => (
            <option key={abbr} value={abbr}>
              {teams[abbr]}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={season}
          onChange={(e) => setSeason(parseInt(e.target.value))}
          min="2000"
          max="2100"
        />
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <h2>Total Rax: {totalRax}</h2>
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Matchup</th>
            <th>Score</th>
            <th>Margin</th>
            <th>Rax</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((s, i) => (
            <tr key={i}>
              <td>{s.game}</td>
              <td>{s.matchup}</td>
              <td>{s.score}</td>
              <td>{s.margin}</td>
              <td>{s.rax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
