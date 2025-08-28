import { useState, useEffect } from 'react';
import SportSelector from '../components/SportSelector';
import SeasonSelector from '../components/SeasonSelector';
import TeamSelector from '../components/TeamSelector';
import ScheduleTable from '../components/ScheduleTable';
import { fetchSports, fetchTeams, fetchSchedule } from '../utils/api';

export default function Home() {
  const [sports, setSports] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchSports().then(setSports);
  }, []);

  useEffect(() => {
    if (selectedSport) {
      const currentYear = new Date().getFullYear();
      const seasonYears = [];
      for (let y = currentYear; y >= 2010; y--) {
        seasonYears.push({
          value: y,
          label: `${y}-${y + 1}`
        });
      }
      setSeasons(seasonYears);
      fetchTeams(selectedSport).then(setTeams);
    }
  }, [selectedSport]);

  useEffect(() => {
    if (selectedSport && selectedSeason && selectedTeam) {
      fetchSchedule(selectedSport, selectedSeason, selectedTeam).then(setSchedule);
    }
  }, [selectedSport, selectedSeason, selectedTeam]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Team Schedule with RAX</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SportSelector sports={sports} onSelect={setSelectedSport} />
        <SeasonSelector seasons={seasons} onSelect={setSelectedSeason} />
        <TeamSelector teams={teams} onSelect={setSelectedTeam} />
      </div>
      <ScheduleTable schedule={schedule} />
    </div>
  );
}