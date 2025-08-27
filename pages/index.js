import { useState, useEffect } from 'react';
import { getTeams, getSchedule, calculateRax } from '../lib/api';

export default function Home() {
  const [sport, setSport] = useState('NHL');
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getTeams(sport);
      setTeams(data);
      setTeam(Object.keys(data)[0] || '');
    }
    fetchTeams();
  }, [sport]);

  useEffect(() => {
    async function fetchSchedule() {
      if (!team) return;
      const data = await getSchedule(sport, team, year);
      setSchedule(data.map(game => ({
        ...game,
        rax: calculateRax(sport, teams[team], game)
      })));
    }
    fetchSchedule();
  }, [team, year, sport, teams]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Team Rax Viewer</h1>

      <label>Sport:</label>
      <select value={sport} onChange={(e) => setSport(e.target.value)}>
        <option value="NHL">NHL</option>
        <option value="NFL">NFL</option>
        <option value="NBA">NBA</option>
      </select>

      <br /><br />

      <label>Team:</label>
      <select value={team} onChange={(e) => setTeam(e.target.value)}>
        {Object.entries(teams).map(([abbr, name]) => (
          <option key={abbr} value={abbr}>{name}</option>
        ))}
      </select>

      <br /><br />

      <label>Year:</label>
      <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <br /><br />

      <h2>Schedule & Rax Earned</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Game</th>
            <th>Score</th>
            <th>Rax Earned</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((g, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
              <td>{new Date(g.date).toLocaleDateString()}</td>
              <td>{g.awayTeam} @ {g.homeTeam}</td>
              <td>{g.awayScore} - {g.homeScore}</td>
              <td>{g.rax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
