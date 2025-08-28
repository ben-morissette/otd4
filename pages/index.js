import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [team, setTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [rax, setRax] = useState(0);

  const sportsOptions = [
    { label: "NFL", value: "football/nfl" },
    { label: "NBA", value: "basketball/nba" },
    { label: "MLB", value: "baseball/mlb" },
    { label: "NHL", value: "hockey/nhl" },
    { label: "CFB", value: "football/college-football" },
    { label: "CBB", value: "basketball/college-basketball" },
    { label: "WNBA", value: "basketball/wnba" },
  ];

  const seasonsOptions = ["2023", "2024", "2025"]; // Can be dynamic later

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sport) return;
    setTeam("");
    setTeams([]);
    fetch(`/api/teams?sport=${sport}`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error(err));
  }, [sport]);

  // Fetch games when sport, season, and team selected
  useEffect(() => {
    if (!sport || !season || !team) return;
    fetch(`/api/schedule?sport=${sport}&season=${season}&team=${team}`)
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error(err));
  }, [sport, season, team]);

  // Calculate RAX whenever games change
  useEffect(() => {
    if (!games.length) return;

    let total = 0;
    games.forEach((g) => {
      const { homeScore, awayScore, winner, isPlayoff } = g;
      const teamScore = g.teamId === g.homeId ? homeScore : awayScore;
      const oppScore = g.teamId === g.homeId ? awayScore : homeScore;
      const diff = teamScore - oppScore;

      switch (sport) {
        case "baseball/mlb":
          if (winner === team) {
            total += isPlayoff ? 20 + 8 * diff : teamScore + 5 * diff;
          } else {
            total += isPlayoff ? 0 : teamScore;
          }
          break;
        case "basketball/nba":
        case "basketball/wnba":
        case "basketball/college-basketball":
          if (winner === team) {
            total += isPlayoff ? 30 + diff : 2.5 * diff;
          }
          break;
        case "hockey/nhl":
          if (winner === team) {
            total += isPlayoff ? 20 + 20 * diff : 12 * diff;
          }
          break;
        case "football/nfl":
        case "football/college-football":
          if (winner === team) {
            total += sport.includes("college") ? 100 + diff : 100 + diff * 2;
          } else {
            total += sport.includes("college") ? Math.min(50, teamScore) : teamScore;
          }
          break;
        default:
          break;
      }
    });

    setRax(Math.max(0, total));
  }, [games, sport, team]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Team RAX Calculator</h1>

      <div>
        <label>Sport:</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">Select Sport</option>
          {sportsOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Season:</label>
        <select value={season} onChange={(e) => setSeason(e.target.value)}>
          <option value="">Select Season</option>
          {seasonsOptions.map((s) => (
            <option key={s} value={s}>
              {s}-{parseInt(s) + 1}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Team:</label>
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2>RAX: {rax}</h2>
      </div>

      <div>
        <h3>Games</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Score</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id}>
                <td>{g.date}</td>
                <td>{g.opponent}</td>
                <td>
                  {g.homeScore} - {g.awayScore}
                </td>
                <td>{g.winner === team ? "W" : "L"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}