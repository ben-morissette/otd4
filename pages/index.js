import { useState, useEffect } from 'react';
import TeamSelector from '../components/TeamSelector';
import RaxUtil from '../utils/raxUtil';

export default function Home() {
  const [sport, setSport] = useState('nfl');
  const [team, setTeam] = useState('');
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState('General');
  const [schedule, setSchedule] = useState([]);
  const [rax, setRax] = useState(0);

  const sports = ['NHL', 'NFL', 'NBA', 'CFB', 'CBB'];

  // Fetch schedule when team or season changes
  useEffect(() => {
    if (!team) return;

    async function fetchSchedule() {
      try {
        const abbr = team;
        const seasonType = 2; // postseason
        const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/teams/${abbr}/schedule?season=${season}&seasontype=${seasonType}`;
        const res = await fetch(url);
        const data = await res.json();
        setSchedule(data.events || []);
        setRax(RaxUtil.calculate(data.events || [])); // example rax
      } catch (err) {
        console.error(err);
      }
    }

    fetchSchedule();
  }, [team, season, sport]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>Sport: </label>
        <select value={sport} onChange={e => setSport(e.target.value.toLowerCase())}>
          {sports.map(s => (
            <option key={s} value={s.toLowerCase()}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Team: </label>
        <TeamSelector sport={sport} onSelect={setTeam} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Season: </label>
        <input
          type="number"
          value={season}
          onChange={e => setSeason(e.target.value)}
          min="2000"
          max={new Date().getFullYear()}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Rarity: </label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          <option>General</option>
          <option>Rare</option>
          <option>Epic</option>
          <option>Legendary</option>
        </select>
      </div>

      <h2>Selected: {`${sport.toUpperCase()} - ${team} - ${season} - ${rarity}`}</h2>
      <h2>RAX: {rax}</h2>

      <h3>Schedule:</h3>
      <ul>
        {schedule.map(game => (
          <li key={game.id}>
            {game.name} - {game.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
