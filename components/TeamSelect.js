import { useState, useEffect } from 'react';

export default function TeamSelector({ sport, onSelect }) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const url = `http://site.api.espn.com/apis/site/v2/sports/football/${sport}/teams`;
        const res = await fetch(url);
        const data = await res.json();
        const allTeams = data.sports[0].leagues[0].teams.map(t => ({
          id: t.team.id,
          name: t.team.displayName,
          abbr: t.team.abbreviation
        }));
        setTeams(allTeams);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    }

    fetchTeams();
  }, [sport]);

  return (
    <select onChange={e => onSelect(e.target.value)}>
      <option value="">Select Team</option>
      {teams.map(team => (
        <option key={team.id} value={team.abbr}>
          {team.name}
        </option>
      ))}
    </select>
  );
}
