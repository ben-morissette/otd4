import { useEffect, useState } from 'react';
import SeasonSelector from '../components/SeasonSelector';
import TeamSelector from '../components/TeamSelector';
import ScheduleTable from '../components/ScheduleTable';

export default function Home() {
  const [sport, setSport] = useState('');
  const [season, setSeason] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [schedule, setSchedule] = useState([]);

  const sports = [
    { value: 'basketball/nba', label: 'NBA' },
    { value: 'football/nfl', label: 'NFL' },
    { value: 'hockey/nhl', label: 'NHL' }
  ];

  // Fetch teams when sport changes
  useEffect(() => {
    if (sport) {
      fetch(`/api/teams?sport=${sport}`)
        .then((res) => res.json())
        .then((data) => setTeams(data))
        .catch((err) => console.error(err));
    } else {
      setTeams([]);
      setSelectedTeam('');
    }
  }, [sport]);

  // Fetch schedule when all three filters are selected
  useEffect(() => {
    if (sport && season && selectedTeam) {
      fetch(`/api/schedule?sport=${sport}&season=${season}&teamId=${selectedTeam}`)
        .then((res) => res.json())
        .then((data) => setSchedule(data))
        .catch((err) => console.error(err));
    } else {
      setSchedule([]);
    }
  }, [sport, season, selectedTeam]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sports Schedule with RAX</h1>

      <select
        className="border p-2 rounded w-full mb-4"
        value={sport}
        onChange={(e) => setSport(e.target.value)}
      >
        <option value="">Select Sport</option>
        {sports.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <SeasonSelector selectedSeason={season} onChange={setSeason} />
      <TeamSelector teams={teams} selectedTeam={selectedTeam} onChange={setSelectedTeam} />

      <ScheduleTable schedule={schedule} />
    </div>
  );
}