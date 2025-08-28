import { useState, useEffect } from "react";

export default function Home() {
  const [sports] = useState([
    "NFL", "NBA", "NHL", "MLB", "WNBA", "CBB", "CFB"
  ]);
  const [selectedSport, setSelectedSport] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [season, setSeason] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams whenever sport changes
  useEffect(() => {
    if (!selectedSport) return;
    setTeams([]);
    setSelectedTeam("");
    fetch(`/api/teams?sport=${selectedSport}`)
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error(err));
  }, [selectedSport]);

  // Fetch schedule whenever team or season changes
  useEffect(() => {
    if (!selectedTeam || !season) return;
    fetch(`/api/schedule?sport=${selectedSport}&teamId=${selectedTeam}&season=${season}`)
      .then(res => res.json())
      .then(data => {
        setSchedule(data.schedule || []);
        setTotalRax(data.totalRax || 0);
      })
      .catch(err => console.error(err));
  }, [selectedTeam, season, selectedSport]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Team Schedule & Rax Calculator</h1>

      <div style={{ margin: "1rem 0" }}>
        <label>Sport: </label>
        <select value={selectedSport} onChange={e => setSelectedSport(e.target.value)}>
          <option value="">--Select Sport--</option>
          {sports.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {selectedSport && (
        <div style={{ margin: "1rem 0" }}>
          <label>Season (Year, e.g., 2024): </label>
          <input
            type="number"
            value={season}
            onChange={e => setSeason(e.target.value)}
            min="2000"
            max="2030"
          />
        </div>
      )}

      {teams.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <label>Team: </label>
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option value="">--Select Team--</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}

      {schedule.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Schedule for {teams.find(t => t.id === selectedTeam)?.name}</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Matchup</th>
                <th>Score</th>
                <th>Type</th>
                <th>Rax</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((game, idx) => (
                <tr key={idx}>
                  <td>{new Date(game.date).toLocaleString()}</td>
                  <td>{game.awayTeam} @ {game.homeTeam}</td>
                  <td>{game.awayScore} - {game.homeScore}</td>
                  <td>{game.type}</td>
                  <td>{game.rax}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total Rax: {totalRax}</h3>
        </div>
      )}
    </div>
  );
}