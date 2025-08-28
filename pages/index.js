import { useEffect, useState } from 'react';
import SeasonSelector from '../components/SeasonSelector';
import TeamSelector from '../components/TeamSelector';
import GameTable from '../components/GameTable';

export default function Home() {
  const [seasons] = useState(["2024", "2023"]);
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams`);
        const data = await res.json();
        const teamList = data.sports[0].leagues[0].teams.map(t => ({
          id: t.team.id,
          name: t.team.displayName
        }));
        setTeams(teamList);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      async function fetchGames() {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${selectedTeam}/schedule`);
          const data = await res.json();
          const schedule = data.events.map(game => ({
            date: game.date,
            name: game.name,
            status: game.status.type.description,
            homeTeam: game.competitions[0].competitors.find(c => c.homeAway === "home").team.displayName,
            awayTeam: game.competitions[0].competitors.find(c => c.homeAway === "away").team.displayName,
            homeScore: game.competitions[0].competitors.find(c => c.homeAway === "home").score ?? "0",
            awayScore: game.competitions[0].competitors.find(c => c.homeAway === "away").score ?? "0",
            rax: 0.0
          }));
          setGames(schedule);
        } catch (error) {
          console.error("Error fetching schedule:", error);
        }
      }
      fetchGames();
    }
  }, [selectedTeam]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>NBA RAX Leaderboard</h1>

      <SeasonSelector
        seasons={seasons}
        selectedSeason={selectedSeason}
        onChange={setSelectedSeason}
      />

      <TeamSelector
        teams={teams}
        selectedTeam={selectedTeam}
        onChange={setSelectedTeam}
      />

      <GameTable games={games} />
    </div>
  );
}