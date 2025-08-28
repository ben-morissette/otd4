import { useState, useEffect } from "react";
import SportSelector from "../components/SportSelector";
import TeamSelector from "../components/TeamSelector";
import SeasonSelector from "../components/SeasonSelector";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    if (!sport) return;
    fetch(`/api/teams?sport=${sport}`)
      .then(r => r.json())
      .then(data => setTeams(data.teams));
  }, [sport]);

  const fetchSchedule = async () => {
    if (!sport || !team) return;
    const res = await fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`);
    const data = await res.json();
    setSchedule(data.schedule);
    setTotalRax(data.totalRax);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule & Rax Viewer</h1>
      <SportSelector sport={sport} setSport={setSport} />
      {sport && <TeamSelector teams={teams} selectedTeam={team} onChangeTeam={setTeam} />}
      <SeasonSelector season={season} setSeason={setSeason} />
      <div>
        <label>Rarity: </label>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          <option>General</option>
          <option>Common</option>
          <option>Uncommon</option>
          <option>Rare</option>
          <option>Epic</option>
          <option>Leg</option>
          <option>Mystic</option>
          <option>Iconic</option>
        </select>
      </div>
      <button onClick={fetchSchedule} style={{ marginTop: "1rem" }}>Load Schedule</button>

      <h2>Total Rax Earned: {totalRax}</h2>
      <table border="1" cellPadding="5" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Matchup</th>
            <th>Score</th>
            <th>Type</th>
            <th>Rax</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((g, idx) => (
            <tr key={idx}>
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
  );
}