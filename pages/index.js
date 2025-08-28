import { useState, useEffect } from "react";
import SportSelector from "../components/SportSelector";
import TeamSelector from "../components/TeamSelector";
import SeasonSelector from "../components/SeasonSelector";

export default function Home() {
  const [sport, setSport] = useState("");
  const [league, setLeague] = useState("");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sport) return;

    setTeam("");
    setTeams([]);

    const [sp, lg] = sport.split("/");
    setLeague(lg);

    fetch(`http://site.api.espn.com/apis/site/v2/sports/${sp}/${lg}/teams`)
      .then((res) => res.json())
      .then((data) => {
        const teamList = data.sports[0].leagues[0].teams.map((t) => ({
          name: t.team.displayName,
          abbreviation: t.team.abbreviation,
        }));
        setTeams(teamList);
      });
  }, [sport]);

  // Fetch schedule when team, season, and rarity are selected
  useEffect(() => {
    if (!team || !season || !sport) return;

    const [sp, lg] = sport.split("/");

    fetch(
      `/api/schedule?sport=${sp}&league=${lg}&team=${team}&season=${season}&rarity=${rarity}`
    )
      .then((res) => res.json())
      .then((data) => setSchedule(data));
  }, [team, season, sport, rarity]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule & Rax Viewer</h1>
      <SportSelector selectedSport={sport} onChangeSport={setSport} />
      {teams.length > 0 && (
        <TeamSelector teams={teams} selectedTeam={team} onChangeTeam={setTeam} />
      )}
      {team && <SeasonSelector season={season} onChangeSeason={setSeason} />}
      {team && (
        <div style={{ marginTop: "1rem" }}>
          <label>Rarity: </label>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            <option value="General">General</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Leg">Leg</option>
            <option value="Mystic">Mystic</option>
            <option value="Iconic">Iconic</option>
          </select>
        </div>
      )}
      {schedule.length > 0 && (
        <table border="1" cellPadding="5" style={{ marginTop: "2rem" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Matchup</th>
              <th>Score</th>
              <th>Type</th>
              <th>Winner</th>
              <th>Rax Earned</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s, idx) => (
              <tr key={idx}>
                <td>{new Date(s.date).toLocaleString()}</td>
                <td>{s.matchup}</td>
                <td>{s.score}</td>
                <td>{s.type}</td>
                <td>{s.winner}</td>
                <td>{s.rax_earned.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}