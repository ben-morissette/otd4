import { useState, useEffect } from 'react';

const SPORTS = [
  { label: 'NFL', value: 'football/nfl' },
  { label: 'MLB', value: 'baseball/mlb' },
  { label: 'NBA', value: 'basketball/nba' },
  { label: 'NHL', value: 'hockey/nhl' },
  { label: 'CFB', value: 'football/college-football' },
  { label: 'CBB', value: 'basketball/college-basketball' },
  { label: 'WNBA', value: 'basketball/wnba' },
];

export default function Home() {
  const [sport, setSport] = useState('');
  const [season, setSeason] = useState('');
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sport) return;
    setTeams([]);
    setTeam('');
    fetch(`http://site.api.espn.com/apis/site/v2/sports/${sport}/teams`)
      .then(res => res.json())
      .then(data => {
        const allTeams = data.sports[0].leagues[0].teams.map(t => ({
          id: t.team.id,
          name: t.team.displayName,
        }));
        setTeams(allTeams);
      });
  }, [sport]);

  useEffect(() => {
    if (!sport || !team || !season) return;
    setSchedule([]);
    setTotalRax(0);
    setLoading(true);

    fetch(`http://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard?season=${season}`)
      .then(res => res.json())
      .then(data => {
        const games = [];
        data.events.forEach(event => {
          const home = event.competitions[0].competitors.find(c => c.homeAway === 'home');
          const away = event.competitions[0].competitors.find(c => c.homeAway === 'away');
          if (home.id === team || away.id === team) {
            const teamComp = home.id === team ? home : away;
            const oppComp = home.id === team ? away : home;
            games.push({
              date: event.date,
              opponent: oppComp.team.displayName,
              teamScore: teamComp.score ? Number(teamComp.score) : 0,
              opponentScore: oppComp.score ? Number(oppComp.score) : 0,
              type: event.status.type.name === 'PLAYOFF' ? 'Playoff' : 'Regular',
              upset: false,
              opponentWinningRecord: false,
            });
          }
        });
        setSchedule(games);
        setTotalRax(calculateRax(sport.split('/')[1].toUpperCase(), games));
      })
      .finally(() => setLoading(false));
  }, [sport, team, season]);

  function calculateRax(sportLabel, games) {
    return games.reduce((total, game) => {
      const teamScore = game.teamScore || 0;
      const opponentScore = game.opponentScore || 0;
      const diff = Math.abs(teamScore - opponentScore);
      let rax = 0;

      switch (sportLabel) {
        case 'MLB':
          if (game.type === 'Playoff') {
            if (teamScore > opponentScore) rax = 20 + 8 * diff;
          } else {
            rax = teamScore;
            if (teamScore > opponentScore) rax += 5 * diff;
          }
          break;

        case 'NHL':
          if (teamScore > opponentScore) {
            rax = diff * 12;
            if (game.type === 'Playoff') rax = 20 + diff * 20;
          }
          break;

        case 'CFB':
          if (teamScore > opponentScore) {
            if (game.upset) rax = 200 + diff;
            else rax = 100 + diff;
          } else {
            rax = Math.min(50, teamScore);
            if (game.upset) rax = 0;
          }
          break;

        case 'NFL':
          if (teamScore > opponentScore) rax = 100 + diff * 2;
          else rax = teamScore;
          break;

        case 'NBA':
          if (teamScore > opponentScore) {
            if (game.type === 'Playoff') rax = 30 + diff;
            else rax = 2.5 * diff;
          }
          break;

        case 'CBB':
          if (teamScore > opponentScore) {
            if (game.type === 'Tournament') rax = 60 + diff;
            else rax = 50 + diff;
          }
          break;

        case 'WNBA':
          if (teamScore > opponentScore) {
            if (game.type === 'Playoff') rax = 80 + diff;
            else rax = (game.opponentWinningRecord ? 50 : 40) + Math.min(diff, 10);
          }
          break;

        default:
          rax = 0;
      }

      return total + rax;
    }, 0);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Team RAX Calculator</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>Sport:</label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="">Select sport</option>
          {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {sport && (
        <div style={{ marginBottom: '1rem' }}>
          <label>Season:</label>
          <select value={season} onChange={e => setSeason(e.target.value)}>
            <option value="">Select season</option>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}–{year + 1}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {teams.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <label>Team:</label>
          <select value={team} onChange={e => setTeam(e.target.value)}>
            <option value="">Select team</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      {loading && <p>Loading schedule...</p>}

      {schedule.length > 0 && (
        <>
          <h2>Schedule & RAX</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Team Score</th>
                <th>Opponent Score</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((game, i) => (
                <tr key={i}>
                  <td>{new Date(game.date).toLocaleString()}</td>
                  <td>{game.opponent}</td>
                  <td>{game.teamScore}</td>
                  <td>{game.opponentScore}</td>
                  <td>{game.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total RAX: {totalRax}</h3>
        </>
      )}
    </div>
  );
}