import { useState, useEffect } from "react";
import SportSelector from "@/components/SportSelector";
import SeasonSelector from "@/components/SeasonSelector";
import TeamSelector from "@/components/TeamSelector";
import axios from "axios";

const RARITY_MULTIPLIERS = {
  General: 1,
  Common: 1.2,
  Uncommon: 1.4,
  Rare: 1.6,
  Epic: 2,
  Leg: 2.5,
  Mystic: 4,
  Iconic: 6,
};

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);
  const [rarity, setRarity] = useState("General");

  // Fetch teams based on sport
  useEffect(() => {
    if (!sport) return;
    const fetchTeams = async () => {
      let url = "";
      if (sport === "NHL") url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
      if (sport === "NFL") url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      if (sport === "NBA") url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

      try {
        const res = await axios.get(url);
        const teamsData = res.data.sports[0].leagues[0].teams.map(t => ({
          abbreviation: t.team.abbreviation,
          name: t.team.displayName
        }));
        setTeams(teamsData);
        setTeam(""); // reset selected team
      } catch (err) {
        console.error(err);
        setTeams([]);
      }
    };
    fetchTeams();
  }, [sport]);

  // Fetch schedule and calculate Rax
  useEffect(() => {
    if (!team || !season) return;

    const fetchSchedule = async () => {
      try {
        let url = "";
        if (sport === "NHL") {
          url = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`;
        }
        if (sport === "NFL") {
          url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`;
        }
        if (sport === "NBA") {
          url = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;
        }

        const res = await axios.get(url);
        const events = res.data.events || [];

        const scheduleWithRax = events.map(event => {
          const comp = event.competitions[0];
          const home = comp.competitors.find(c => c.homeAway === "home");
          const away = comp.competitors.find(c => c.homeAway === "away");

          const homeScore = home.score ? parseInt(home.score) : 0;
          const awayScore = away.score ? parseInt(away.score) : 0;

          const isWin = home.team.abbreviation === team ? homeScore > awayScore : awayScore > homeScore;
          let rax = 0;

          // Rax calculation
          if (sport === "NHL") {
            if (isWin) rax = 12 * Math.abs(homeScore - awayScore);
          }
          if (sport === "NFL") {
            if (isWin) rax = 100 + 2 * Math.abs(homeScore - awayScore);
            else rax = (home.team.abbreviation === team ? homeScore : awayScore) + 5;
          }
          if (sport === "NBA") {
            if (isWin) rax = 2.5 * Math.abs(homeScore - awayScore);
          }

          rax *= RARITY_MULTIPLIERS[rarity] || 1;

          return {
            date: new Date(event.date).toLocaleString(),
            matchup: event.name,
            score: `${awayScore} - ${homeScore}`,
            type: "Regular Season",
            rax: rax.toFixed(2),
          };
        });

        setSchedule(scheduleWithRax);
        const total = scheduleWithRax.reduce((acc, game) => acc + parseFloat(game.rax), 0);
        setTotalRax(total.toFixed(2));
      } catch (err) {
        console.error(err);
        setSchedule([]);
        setTotalRax(0);
      }
    };

    fetchSchedule();
  }, [team, season, sport, rarity]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule & Rax Calculator</h1>

      <SportSelector selectedSport={sport} onChangeSport={setSport} />
      {sport && <SeasonSelector selectedSeason={season} onChangeSeason={setSeason} />}
      {teams.length > 0 && <TeamSelector teams={teams} selectedTeam={team} onChangeTeam={setTeam} />}

      {schedule.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Total Rax Earned: {totalRax}</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Matchup</th>
                <th>Score</th>
                <th>Type</th>
                <th>Rax Earned</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((g, i) => (
                <tr key={i}>
                  <td>{g.date}</td>
                  <td>{g.matchup}</td>
                  <td>{g.score}</td>
                  <td>{g.type}</td>
                  <td>{g.rax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}