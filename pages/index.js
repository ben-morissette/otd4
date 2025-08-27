import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("");
  const [schedule, setSchedule] = useState(null);

  // Load teams when sport changes
  useEffect(() => {
    if (!sport) return;
    setTeam("");
    fetch(`/api/teams?sport=${sport}`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error(err));
  }, [sport]);

  // Load schedule when team and season are selected
  useEffect(() => {
    if (!team || !season) return;
    fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch((err) => console.error(err));
  }, [team, season]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Select Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">--Select Sport--</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      {sport && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Select Team: </label>
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

      {sport && team && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Season: </label>
          <input
            type="number"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="e.g. 2024"
          />
        </div>
      )}

      {schedule && (
        <div>
          <h2>Schedule</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(schedule, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
