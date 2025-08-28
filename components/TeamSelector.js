import { useEffect, useState } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sport) return;

    setTeams({});
    setTeam("");

    const fetchTeams = async () => {
      let url = "";
      switch (sport) {
        case "NFL":
          url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
          break;
        case "NBA":
          url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
          break;
        case "NHL":
          url = "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
          break;
        default:
          return;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        const newTeams = {};
        data.sports[0].leagues[0].teams.forEach((t) => {
          newTeams[t.team.abbreviation] = t.team.displayName;
        });
        setTeams(newTeams);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
  }, [sport]);

  // Fetch schedule + calculate Rax
  useEffect(() => {
    if (!team || !sport) return;

    const fetchSchedule = async () => {
      let url = "";
      switch (sport) {
        case "NFL":
          url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}`;
          break;
        case "NBA":
          url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}`;
          break;
        case "NHL":
          url = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}`;
          break;
        default:
          return;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        const events = (data.events || []).map((event) => {
          const comp = event.competitions[0];
          const home = comp.competitors.find((c) => c.homeAway === "home");
          const away = comp.competitors.find((c) => c.homeAway === "away");
          const homeScore = parseInt(home.score || 0);
          const awayScore = parseInt(away.score || 0);
          const winner = homeScore > awayScore ? home.team.displayName :
                         awayScore > homeScore ? away.team.displayName : "Tie";
          const margin = Math.abs(homeScore - awayScore);

          // Simple Rax example for NFL, extend logic per your rules
          let rax = 0;
          if (sport === "NFL") {
            if (winner === teams[team]) {
              rax = 100 + margin * 2;
            } else if (winner !== "Tie") {
              rax = homeScore + awayScore;
            }
          }

          return {
            date: event.date,
            matchup: `${away.team.displayName} @ ${home.team.displayName}`,
            score: `${awayScore} - ${homeScore}`,
            winner,
            rax
          };
        });

        setSchedule(events);
        setTotalRax(events.reduce((acc, e) => acc + e.rax, 0));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedule();
  }, [team, sport, season, teams]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>

      <div>
        <label>Sport:</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">Select Sport</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
          <option value="NHL">NHL</option>
        </select>
      </div>

      {sport && (
        <div>
          <label>Team:</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            disabled={!Object.keys(teams).length}
          >
            <option value="">Select Team</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {sport && (
        <div>
          <label>Season:</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value))}
          />
        </div>
      )}

      {schedule.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Total Rax: {totalRax}</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matchup</th>
                <th>Score</th>
                <th>Winner</th>
                <th>Rax</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((game, idx) => (
                <tr key={idx}>
                  <td>{new Date(game.date).toLocaleString()}</td>
                  <td>{game.matchup}</td>
                  <td>{game.score}</td>
                  <td>{game.winner}</td>
                  <td>{game.rax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}