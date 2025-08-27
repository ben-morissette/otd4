import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

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

const SPORTS = ['NHL', 'NFL', 'NBA', 'WNBA', 'CFB', 'CBB', 'MLB'];

export default function Home() {
  const [sport, setSport] = useState('');
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState('');
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState('General');
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams
  useEffect(() => {
    if (!sport) return;
    async function fetchTeams() {
      try {
        const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport === 'CFB' || sport === 'CBB' ? 'mens-college-basketball' : sport.toLowerCase()}/teams`;
        const res = await axios.get(url);
        const teamsData = res.data.sports[0].leagues[0].teams;
        setTeams(teamsData.map(t => ({
          abbr: t.team.abbreviation,
          name: t.team.displayName
        })));
        setTeam('');
      } catch (e) {
        console.error(e);
        setTeams([]);
      }
    }
    fetchTeams();
  }, [sport]);

  // Fetch schedule & calculate Rax
  useEffect(() => {
    if (!team || !sport) return;
    async function fetchSchedule() {
      try {
        const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport === 'CFB' || sport === 'CBB' ? 'mens-college-basketball' : sport.toLowerCase()}/teams/${team}/schedule?season=${season}&seasontype=2`;
        const res = await axios.get(url);
        const events = res.data.events || [];
        let total = 0;

        const rows = events.map(event => {
          const comp = event.competitions[0];
          let homeScore = 0, awayScore = 0;
          comp.competitors.forEach(c => {
            const s = parseInt(c.score || 0);
            if (c.homeAway === 'home') homeScore = s;
            else awayScore = s;
          });

          const W = homeScore > awayScore ? 'W' : 'L';
          const margin = Math.abs(homeScore - awayScore);

          // Base Rax
          let baseRax = W === 'W' ? margin * 12 : 0;

          // Close-game bonus
          if (W === 'W' && margin <= 3) baseRax += 5;

          // Playoff multiplier
          const isPlayoff = comp.season.type === 3; // ESPN = 3 is postseason
          const playoffRax = isPlayoff ? baseRax * 1.5 : baseRax;

          // Apply rarity multiplier
          const finalRax = playoffRax * (RARITY_MULTIPLIERS[rarity] || 1);
          total += finalRax;

          return {
            date: dayjs(event.date).tz('America/New_York').format('YYYY MMMM D h:mm A'),
            name: event.name,
            score: `${awayScore} - ${homeScore}`,
            W,
            margin,
            baseRax,
            finalRax
          };
        });

        setSchedule(rows);
        setTotalRax(total);
      } catch (e) {
        console.error(e);
        setSchedule([]);
        setTotalRax(0);
      }
    }
    fetchSchedule();
  }, [team, season, rarity, sport]);

  return (
    <div style={{ padding: '2rem', background: '#121212', color: '#fff', minHeight: '100vh' }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ margin: '1rem 0' }}>
        <label>Sport:</label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="">Select Sport</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {teams.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <label>Team:</label>
          <select value={team} onChange={e => setTeam(e.target.value)}>
            <option value="">Select Team</option>
            {teams.map(t => <option key={t.abbr} value={t.abbr}>{t.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ margin: '1rem 0' }}>
        <label>Season:</label>
        <input type="number" value={season} onChange={e => setSeason(parseInt(e.target.value))} />
      </div>

      <div style={{ margin: '1rem 0' }}>
        <label>Rarity:</label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <h2>Total Rax Earned: {totalRax.toFixed(2)}</h2>

      {schedule.length > 0 && (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%', color: '#fff' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Game</th>
              <th>Score</th>
              <th>W/L</th>
              <th>Margin</th>
              <th>Base Rax</th>
              <th>Final Rax</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>{row.name}</td>
                <td>{row.score}</td>
                <td>{row.W}</td>
                <td>{row.margin}</td>
                <td>{row.baseRax}</td>
                <td>{row.finalRax.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
