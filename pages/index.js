import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [team, setTeam] = useState("");
  const [teamsList, setTeamsList] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Load teams when sport changes
  useEffect(() => {
    if (!sport) return;
    setTeam(""); // reset team when sport changes
    setSchedule([]);
    setTotalRax(0);

    const fetchTeams = async () => {
      try {
        const res = await fetch(`/api/teams?sport=${sport}`);
        const data = await res.json();
        setTeamsList(data.teams || []);
      } catch (err) {
        console.error(err);
        setTeamsList([]);
      }
    };

    fetchTeams();
  }, [sport]);

  // Load schedule when sport, team, and season are all selected
  useEffect(() => {
    if (!sport || !team || !season) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(
          `/api/schedule?sport=${sport}&team=${team}&season=${season}`
        );
        const data = await res.json();
        setSchedule(data.schedule || []);
        setTotalRax(data.total_rax || 0);
      } catch (err) {
        console.error(err);
        setSchedule([]);
        setTotalRax(0);
      }
    };

    fetchSchedule();
  }, [sport, team, season]);

  return (
    <div>
      {/* Sport Selection */}
      <select value={sport} onChange={(e) => setSport(e.target.value)}>
        <option value="">Select Sport</option>
        <option value="NFL">NFL</option>
        <option value="NHL">NHL</option>
        <option value="NBA">NBA</option>
      </select>

      {/* Season Selection */}
      {sport && (
        <input
          type="number"
          value={season}
          min={2000}
          max={2100}
          placeholder="Season (e.g. 2024)"
          onChange={(e) => setSeason(e.target.value)}
        />
      )}

      {/* Team Selection */}
      {sport && teamsList.length > 0 && (
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">Select Team</option>
          {teamsList.map((t) => (
            <option key={t.abbr} value={t.abbr}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      {/* Total Rax */}
      <div>Total Rax: {totalRax}</div>

      {/* Schedule Table */}
      {schedule.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Score</th>
              <th>Type</th>
              <th>W/L</th>
              <th>Rax Earned</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>{row.name}</td>
                <td>{row.Score}</td>
                <td>{row.type}</td>
                <td>{row["W/L"]}</td>
                <td>{row.rax_earned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}