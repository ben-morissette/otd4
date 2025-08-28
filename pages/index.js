import { useEffect, useState } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const sportsOptions = ["NFL","NBA","NHL","MLB","WNBA","CBB","CFB"];
  const seasonOptions = Array.from({length: 5}, (_, i) => 2021+i); // Example seasons

  useEffect(() => {
    if (!sport) return;
    setTeams([]);
    setTeamId("");
    fetch(`/api/teams?sport=${sport}`)
      .then(r => r.json())
      .then(data => setTeams(data))
      .catch(console.error);
  }, [sport]);

  useEffect(() => {
    if (!sport || !teamId || !season) return;
    setSchedule([]);
    fetch(`/api/schedule?sport=${sport}&teamId=${teamId}&season=${season}`)
      .then(r => r.json())
      .then(data => setSchedule(data))
      .catch(console.error);
  }, [sport, teamId, season]);

  const calcRax = (game) => {
    if (!game.competitions) return 0;

    const home = game.competitions[0].competitors.find(c => c.homeAway === "home");
    const away = game.competitions[0].competitors.find(c => c.homeAway === "away");
    const team = home.id === teamId ? home : away;
    const opponent = home.id === teamId ? away : home;

    const teamScore = parseInt(team.score) || 0;
    const oppScore = parseInt(opponent.score) || 0;
    const diff = teamScore - oppScore;
    const isWin = diff > 0;
    const isPlayoff = game.season.type === "postseason";

    switch(sport.toUpperCase()) {
      case "MLB":
        if(isPlayoff) return isWin ? 20 + diff*8 : 0;
        return isWin ? teamScore + diff*5 : teamScore;
      case "NHL":
        if(isPlayoff) return isWin ? 20 + diff*20 : 0;
        return isWin ? diff*12 : 0;
      case "NFL":
        return isWin ? 100 + diff*2 : teamScore; 
      case "NBA":
        if(isPlayoff) return isWin ? 30 + diff : 0;
        return isWin ? diff*2.5 : 0;
      case "CFB":
        if(isWin) return 100 + diff; // ignoring ranked bonus for simplicity
        return Math.min(teamScore, 50);
      case "CBB":
        if(isPlayoff) return 60 + diff;
        return isWin ? 50 + diff : 0;
      case "WNBA":
        if(isPlayoff) return 80 + diff;
        return isWin ? (team.record && team.record.items && parseInt(team.record.items[0].stats.wins) > parseInt(team.record.items[0].stats.losses) ? 50 : 40) + Math.min(diff,10) : 0;
      default:
        return 0;
    }
  };

  return (
    <div style={{padding:20}}>
      <h1>Sports Rax Calculator</h1>

      <div>
        <label>Sport:</label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="">Select sport</option>
          {sportsOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label>Season:</label>
        <select value={season} onChange={e => setSeason(e.target.value)} disabled={!sport}>
          <option value="">Select season</option>
          {seasonOptions.map(s => <option key={s} value={s}>{s}-{parseInt(s)+1}</option>)}
        </select>
      </div>

      <div>
        <label>Team:</label>
        <select value={teamId} onChange={e => setTeamId(e.target.value)} disabled={!teams.length}>
          <option value="">Select team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <h2>Schedule & Rax</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Matchup</th>
              <th>Score</th>
              <th>Status</th>
              <th>Rax</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(g => (
              <tr key={g.id}>
                <td>{new Date(g.date).toLocaleString()}</td>
                <td>{g.name}</td>
                <td>
                  {g.competitions && g.competitions[0].competitors.map(c => `${c.team.abbreviation} ${c.score}`).join(" - ")}
                </td>
                <td>{g.status ? g.status.type.description : "N/A"}</td>
                <td>{calcRax(g)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}