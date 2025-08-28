import { useState, useEffect } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState(""); // new
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [schedule, setSchedule] = useState([]);

  const sports = ["NFL","NBA","NHL","MLB","WNBA","CBB","CFB"];
  const seasons = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year.toString() };
  });

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sport) return;
    fetch(`/api/teams?sport=${sport}`)
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error(err));
    setTeamId("");
    setSchedule([]);
    setSeason(""); // reset season when sport changes
  }, [sport]);

  // Fetch schedule when team and season change
  useEffect(() => {
    if (!teamId || !season) return;
    fetch(`/api/schedule?sport=${sport}&teamId=${teamId}&season=${season}`)
      .then(res => res.json())
      .then(data => setSchedule(data))
      .catch(err => console.error(err));
  }, [teamId, season]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Rax Calculator</h1>

      <div>
        <label>Sport:</label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="">Select sport</option>
          {sports.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label>Season:</label>
        <select value={season} onChange={e => setSeason(e.target.value)} disabled={!sport}>
          <option value="">Select season</option>
          {seasons.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div>
        <label>Team:</label>
        <select value={teamId} onChange={e => setTeamId(e.target.value)} disabled={!season}>
          <option value="">Select team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <h2>Schedule & Rax</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Date</th>
            <th>Home</th>
            <th>Away</th>
            <th>Status</th>
            <th>Rax</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(g => (
            <tr key={g.id}>
              <td>{new Date(g.date).toLocaleString()}</td>
              <td>{g.homeTeam.name} ({g.homeTeam.score})</td>
              <td>{g.awayTeam.name} ({g.awayTeam.score})</td>
              <td>{g.status}</td>
              <td>{g.rax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}