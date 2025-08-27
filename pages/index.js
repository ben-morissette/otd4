import { useState, useEffect } from "react";
import axios from "axios";

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

const TEAM_API = {
  NHL: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams",
  NFL: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams",
  NBA: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams",
};

const PLAYOFF_NAMES = {
  NHL: { 1: "Conference Quarterfinals", 2: "Conference Semifinals", 3: "Conference Finals", 4: "Stanley Cup Final" },
  NFL: { 1: "Wild Card", 2: "Divisional Round", 3: "Conference Championship", 4: "Super Bowl" },
  NBA: { 1: "First Round", 2: "Conference Semifinals", 3: "Conference Finals", 4: "NBA Finals" },
};

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(TEAM_API[sport]);
        const data = res.data.sports[0].leagues[0].teams;
        const teamMap = {};
        data.forEach((t) => {
          teamMap[t.team.abbreviation] = t.team.displayName;
        });
        setTeams(teamMap);
        setTeam(Object.keys(teamMap)[0] || "");
      } catch (err) {
        console.error(err);
        setTeams({});
      }
    };
    fetchTeams();
  }, [sport]);

  const fetchSchedule = async () => {
    if (!team) return;
    try {
      const seasonType = 2; // Regular season
      const playoffType = 3; // Playoffs

      const url = `https://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport}/teams/${team}/schedule?season=${season}&seasontype=${seasonType}`;
      const playoffUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport}/teams/${team}/schedule?season=${season}&seasontype=${playoffType}`;

      const [res, playoffRes] = await Promise.all([axios.get(url), axios.get(playoffUrl)]);
      const events = res.data.events || [];
      const playoffEvents = playoffRes.data.events || [];

      let sched = [];
      let total = 0;
      let gameNum = 1;
      let playoffRound = 0;
      let playoffOpponent = "";
      const rarityMultiplier = RARITY_MULTIPLIERS[rarity];

      const processEvent = (event, type) => {
        const competitors = event.competitions[0].competitors;
        const home = competitors.find((c) => c.homeAway === "home") || {};
        const away = competitors.find((c) => c.homeAway === "away") || {};

        const homeScore = home.score || 0;
        const awayScore = away.score || 0;

        const winner = homeScore > awayScore ? home.team.abbreviation : homeScore < awayScore ? away.team.abbreviation : "Tie";
        const loser = winner === home.team.abbreviation ? away.team.abbreviation : winner === away.team.abbreviation ? home.team.abbreviation : "Tie";
        const margin = Math.abs(homeScore - awayScore);

        let baseRax = 0;
        if (winner === team) {
          baseRax = type === "Playoffs" ? 20 + 20 * margin : 12 * margin;
        } else if (winner === "Tie") {
          baseRax = 0;
        } else {
          baseRax = homeScore + 5; // close game bonus for loss
        }

        const rax = baseRax * rarityMultiplier;
        total += rax;

        let gameLabel = "";
        if (type === "Regular") {
          gameLabel = `Game ${gameNum}`;
          gameNum++;
        } else {
          const opponent = [home.team.abbreviation, away.team.abbreviation].find((abbr) => abbr !== team);
          if (opponent !== playoffOpponent) {
            playoffOpponent = opponent;
            playoffRound++;
          }
          gameLabel = `${PLAYOFF_NAMES[sport][playoffRound] || `Playoffs_${playoffRound}`} Game`;
        }

        sched.push({
          game: gameLabel,
          date: new Date(event.date).toLocaleString("en-US", { timeZone: "America/New_York" }),
          opponent: event.name.split(" at ").find((n) => n !== teams[team]) || "",
          score: `${awayScore} - ${homeScore}`,
          W_L: winner === team ? "W" : loser === team ? "L" : "",
          baseRax,
          rax: rax.toFixed(2),
        });
      };

      events.forEach((e) => processEvent(e, "Regular"));
      playoffEvents.forEach((e) => processEvent(e, "Playoffs"));

      setSchedule(sched);
      setTotalRax(total.toFixed(2));
    } catch (err) {
      console.error(err);
      setSchedule([]);
      setTotalRax(0);
    }
  };

  return (
    <div style={{ background: "#121212", color: "#eee", minHeight: "100vh", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option>NHL</option>
          <option>NFL</option>
          <option>NBA</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Team: </label>
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          {Object.keys(teams).map((abbr) => (
            <option key={abbr} value={abbr}>
              {teams[abbr]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Season: </label>
        <input
          type="number"
          value={season}
          min="2000"
          max="2100"
          onChange={(e) => setSeason(parseInt(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Rarity: </label>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <button onClick={fetchSchedule} style={{ padding: "0.5rem 1rem", marginBottom: "2rem" }}>
        Fetch Schedule
      </button>

      <h2>Total Rax Earned: {totalRax}</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Game</th>
            <th>Date</th>
            <th>Opponent</th>
            <th>Score</th>
            <th>W/L</th>
            <th>Base Rax</th>
            <th>Rax</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, i) => (
            <tr key={i}>
              <td>{row.game}</td>
              <td>{row.date}</td>
              <td>{row.opponent}</td>
              <td>{row.score}</td>
              <td>{row.W_L}</td>
              <td>{row.baseRax}</td>
              <td>{row.rax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
