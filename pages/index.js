import { useEffect, useState } from "react";
import axios from "axios";

const RARITY_MULTIPLIERS = {
  "General": 1,
  "Common": 1.2,
  "Uncommon": 1.4,
  "Rare": 1.6,
  "Epic": 2,
  "Leg": 2.5,
  "Mystic": 4,
  "Iconic": 6
};

const SPORTS = ["NHL", "NFL", "NBA"];

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [year, setYear] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams dynamically
  useEffect(() => {
    const fetchTeams = async () => {
      let url;
      if (sport === "NHL") url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
      if (sport === "NFL") url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      if (sport === "NBA") url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

      const res = await axios.get(url);
      const data = res.data.sports[0].leagues[0].teams;
      const teamMap = data.map(t => ({ abbr: t.team.abbreviation, name: t.team.displayName }));
      setTeams(teamMap);
      if (teamMap.length > 0) setTeam(teamMap[0].abbr);
    };
    fetchTeams();
  }, [sport]);

  // Fetch schedule and calculate Rax
  const fetchSchedule = async () => {
    if (!team) return;
    let url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport}/teams/${team}/schedule?season=${year}&seasontype=2`;
    const res = await axios.get(url);
    const events = res.data.events || [];
    let total = 0;
    const rows = events.map(event => {
      const competitors = event.competitions[0].competitors;
      const home = competitors.find(c => c.homeAway === "home");
      const away = competitors.find(c => c.homeAway === "away");
      let margin = Math.abs((home.score || 0) - (away.score || 0));
      let rax = 0;

      // Rax rules example (you can extend for all sports)
      if (sport === "NHL") {
        if ((home.team.abbreviation === team && home.score > away.score) || (away.team.abbreviation === team && away.score > home.score)) {
          rax = 12 * margin;
        }
      } else if (sport === "NFL") {
        const closeBonus = 5;
        if ((home.team.abbreviation === team && home.score > away.score) || (away.team.abbreviation === team && away.score > home.score)) {
          rax = 100 + margin * 2;
        } else {
          rax = (home.team.abbreviation === team ? home.score : away.score) + closeBonus;
        }
      } else if (sport === "NBA") {
        if ((home.team.abbreviation === team && home.score > away.score) || (away.team.abbreviation === team && away.score > home.score)) {
          rax = 2.5 * margin;
        }
      }

      rax *= RARITY_MULTIPLIERS[rarity] || 1;
      total += rax;

      return {
        date: event.date,
        matchup: event.name,
        score: `${away.score || 0} - ${home.score || 0}`,
        rax: rax.toFixed(1)
      };
    });
    setSchedule(rows);
    setTotalRax(total.toFixed(1));
  };

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Team Schedule & Rax Viewer</h1>

      <div className="flex gap-4 mb-4 flex-wrap">
        <select className="p-2 bg-card" value={sport} onChange={e => setSport(e.target.value)}>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="p-2 bg-card" value={team} onChange={e => setTeam(e.target.value)}>
          {teams.map(t => <option key={t.abbr} value={t.abbr}>{t.name}</option>)}
        </select>

        <select className="p-2 bg-card" value={year} onChange={e => setYear(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => 2024 + i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select className="p-2 bg-card" value={rarity} onChange={e => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <button className="p-2 bg-primary text-black font-bold" onClick={fetchSchedule}>Fetch Schedule</button>
      </div>

      <h2 className="text-xl mb-2">Total Rax Earned: {totalRax}</h2>

      <table className="min-w-full bg-card text-white">
        <thead>
          <tr>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Matchup</th>
            <th className="border px-2 py-1">Score</th>
            <th className="border px-2 py-1">Rax</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{row.date}</td>
              <td className="border px-2 py-1">{row.matchup}</td>
              <td className="border px-2 py-1">{row.score}</td>
              <td className="border px-2 py-1">{row.rax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
