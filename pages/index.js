import { useEffect, useState } from "react";
import axios from "axios";

// Rax multipliers for rarity
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

// ESPN team APIs
const TEAM_API = {
  NHL: "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams",
  NFL: "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams",
  NBA: "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams"
};

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [team, setTeam] = useState("");
  const [teams, setTeams] = useState({});
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams dynamically whenever sport changes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(TEAM_API[sport]);
        const data = res.data.sports[0].leagues[0].teams || [];
        const teamMap = {};
        data.forEach((t) => {
          if (t.team && t.team.abbreviation && t.team.displayName) {
            teamMap[t.team.abbreviation] = t.team.displayName;
          }
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

  // Fetch schedule & calculate Rax
  const fetchSchedule = async () => {
    if (!team) return;
    try {
      const url = `http://site.api.espn.com/apis/site/v2/sports/${
        sport === "NHL" ? "hockey/nhl" : sport === "NFL" ? "football/nfl" : "basketball/nba"
      }/teams/${team}/schedule?season=${season}&seasontype=2`;

      const res = await axios.get(url);
      const events = res.data.events || [];
      const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
      let total = 0;

      const scheduleData = events.map((event, idx) => {
        const home = event.competitions[0].competitors.find(c => c.homeAway === "home");
        const away = event.competitions[0].competitors.find(c => c.homeAway === "away");

        const homeScore = Number(home.score) || 0;
        const awayScore = Number(away.score) || 0;
        let baseRax = 0;

        // Simple example: customize per sport Rax rules
        if (sport === "NHL") {
          if ((home.team.abbreviation === team && homeScore > awayScore) ||
              (away.team.abbreviation === team && awayScore > homeScore)) {
            baseRax = 12 * Math.abs(homeScore - awayScore);
          }
        } else if (sport === "NFL") {
          if ((home.team.abbreviation === team && homeScore > awayScore) ||
              (away.team.abbreviation === team && awayScore > homeScore)) {
            baseRax = 100 + 2 * Math.abs(homeScore - awayScore);
          } else {
            baseRax = (home.team.abbreviation === team ? homeScore : awayScore) + 5;
          }
        } else if (sport === "NBA") {
          if ((home.team.abbreviation === team && homeScore > awayScore) ||
              (away.team.abbreviation === team && awayScore > homeScore)) {
            baseRax = 2.5 * Math.abs(homeScore - awayScore);
          }
        }

        const raxEarned = baseRax * rarityMultiplier;
        total += raxEarned;

        return {
          game: `Game ${idx + 1}`,
          matchup: `${away.team.abbreviation} @ ${home.team.abbreviation}`,
          score: `${awayScore} - ${homeScore}`,
          W_L: ((home.team.abbreviation === team && homeScore > awayScore) || (away.team.abbreviation === team && awayScore > homeScore)) ? "W" : "L",
          baseRax,
          raxEarned
        };
      });

      setSchedule(scheduleData);
      setTotalRax(total);
    } catch (err) {
      console.error(err);
      setSchedule([]);
      setTotalRax(0);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Team Schedule & Rax Viewer</h1>

      <div className="flex gap-4 mb-4">
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="p-2 rounded bg-gray-700"
        >
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>

        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="p-2 rounded bg-gray-700"
        >
          {Object.entries(teams).map(([abbr, name]) => (
            <option key={abbr} value={abbr}>{name}</option>
          ))}
        </select>

        <input
          type="number"
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="p-2 rounded bg-gray-700 w-24"
        />

        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="p-2 rounded bg-gray-700"
        >
          {Object.keys(RARITY_MULTIPLIERS).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button
          onClick={fetchSchedule}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Fetch Schedule
        </button>
      </div>

      <h2 className="text-xl font-bold mb-2">Total Rax Earned: {totalRax.toFixed(2)}</h2>

      <table className="table-auto border-collapse border border-gray-600 w-full text-center">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-600 px-2 py-1">Game</th>
            <th className="border border-gray-600 px-2 py-1">Matchup</th>
            <th className="border border-gray-600 px-2 py-1">Score</th>
            <th className="border border-gray-600 px-2 py-1">W/L</th>
            <th className="border border-gray-600 px-2 py-1">Base Rax</th>
            <th className="border border-gray-600 px-2 py-1">Rax Earned</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-700">
              <td className="border border-gray-600 px-2 py-1">{row.game}</td>
              <td className="border border-gray-600 px-2 py-1">{row.matchup}</td>
              <td className="border border-gray-600 px-2 py-1">{row.score}</td>
              <td className="border border-gray-600 px-2 py-1">{row.W_L}</td>
              <td className="border border-gray-600 px-2 py-1">{row.baseRax}</td>
              <td className="border border-gray-600 px-2 py-1">{row.raxEarned.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
