import { useState, useEffect } from 'react';
import SportSelector from '../components/SportSelector';
import TeamSelector from '../components/TeamSelector';
import SeasonSelector from '../components/SeasonSelector';

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      if (!sport) return;

      let url;
      if (sport === "NHL") url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
      if (sport === "NFL") url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      if (sport === "NBA") url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

      const res = await fetch(url);
      const data = await res.json();
      const teamList = data.sports[0].leagues[0].teams.map(t => ({
        name: t.team.displayName,
        abbreviation: t.team.abbreviation
      }));
      setTeams(teamList);
    }

    fetchTeams();
  }, [sport]);

  useEffect(() => {
    async function fetchSchedule() {
      if (!sport || !team) return;

      const res = await fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}`);
      const data = await res.json();
      setSchedule(data.events || []);
    }

    fetchSchedule();
  }, [sport, team, season]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>
      <SportSelector selectedSport={sport} onChangeSport={setSport} />
      {sport && (
        <TeamSelector teams={teams} selectedTeam={team} onChangeTeam={setTeam} />
      )}
      {sport && <SeasonSelector selectedSeason={season} onChangeSeason={setSeason} />}
      <div>
        <h2>Schedule</h2>
        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Matchup</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((event, idx) => (
              <tr key={idx}>
                <td>{event.date}</td>
                <td>{event.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}