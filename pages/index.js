import { useState, useEffect } from "react";

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

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("");
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Load teams
  useEffect(() => {
    if (!sport) return;
    setTeam("");
    fetch(`/api/teams?sport=${sport}`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(console.error);
  }, [sport]);

  // Load schedule
  useEffect(() => {
    if (!team || !season) return;
    fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}`)
      .then((res) => res.json())
      .then((data) => {
        const teamName = data.team?.displayName || "";
        if (!data.events) {
          setSchedule([]);
          setTotalRax(0);
          return;
        }

        const scheduleList = data.events.map((event) => {
          let homeScore = 0,
            awayScore = 0,
            homeName = "",
            awayName = "";
          const comp = event.competitions?.[0]?.competitors || [];
          comp.forEach((c) => {
            if (c.homeAway === "home") {
              homeScore = Number(c.score || 0);
              homeName = c.team?.displayName || "";
            } else {
              awayScore = Number(c.score || 0);
              awayName = c.team?.displayName || "";
            }
          });

          let winner = "",
            loser = "";
          if (homeScore > awayScore) {
            winner = homeName;
            loser = awayName;
          } else if (awayScore > homeScore) {
            winner = awayName;
            loser = homeName;
          } else {
            winner = loser = "Tie";
          }

          const margin = Math.abs(homeScore - awayScore);

          // Base RAX
          let baseRax = 0;
          if (winner === teamName) {
            baseRax = event.type === "playoffs" ? 20 + 20 * margin : 12 * margin;
          }

          return {
            date: event.date,
            name: event.name,
            home: homeName,
            away: awayName,
            homeScore,
            awayScore,
            winner,
            loser,
            margin,
            baseRax,
            rax: baseRax * RARITY_MULTIPLIERS[rarity]
          };
        });

        const total = scheduleList.reduce((acc, e) => acc + e.rax, 0);
        setSchedule(scheduleList);
        setTotalRax(total);
      })
      .catch(console.error);
  }, [team, season, rarity]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>

      <div>
        <label>Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">--Select Sport--</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      {sport && (
        <div>
          <label>Team: </label>
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">--Select Team--</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {team && (
        <div>
          <label>Season: </label>
          <input
            type="number"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="e.g. 2024"
          />
        </div>
      )}

      {team && (
        <div>
          <label>Rarity: </label>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            {Object.keys(RARITY_MULTIPLIERS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {schedule.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Schedule</h2>
          <h3>Total RAX: {totalRax.toFixed(2)}</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                <th>Score</th>
                <th>W/L</th>
                <th>Margin</th>
                <th>RAX</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>
                    {row.away} @ {row.home}
                  </td>
                  <td>
                    {row.awayScore} - {row.homeScore}
                  </td>
                  <td>
                    {row.winner === team ? "W" : row.loser === team ? "L" : ""}
                  </td>
                  <td>{row.margin}</td>
                  <td>{row.rax.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}