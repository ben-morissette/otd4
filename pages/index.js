import { useState, useEffect } from "react";
import TeamSelector from "../components/TeamSelector";

export default function Home() {
  const [sport, setSport] = useState("NFL");
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2025);
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Example: fetch team list for sport
    if (sport === "NFL") {
      setTeams([
        { name: "New York Giants", abbreviation: "NYG" },
        { name: "Dallas Cowboys", abbreviation: "DAL" },
        { name: "Green Bay Packers", abbreviation: "GB" },
      ]);
    }
    if (sport === "NBA") {
      setTeams([
        { name: "Lakers", abbreviation: "LAL" },
        { name: "Warriors", abbreviation: "GSW" },
      ]);
    }
    if (sport === "NHL") {
      setTeams([
        { name: "Toronto Maple Leafs", abbreviation: "TOR" },
        { name: "Montreal Canadiens", abbreviation: "MTL" },
      ]);
    }
  }, [sport]);

  const fetchSchedule = async () => {
    if (!team) return;
    const res = await fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}`);
    const data = await res.json();
    setSchedule(data.schedule);
    setTotalRax(data.totalRax);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule & Rax</h1>
      <div>
        <label>Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
          <option value="NHL">NHL</option>
        </select>
      </div>
      <TeamSelector teams={teams} selectedTeam={team} onChangeTeam={setTeam} />
      <div>
        <label>Season: </label>
        <input type="number" value={season} onChange={(e) => setSeason(e.target.value)} />
      </div>
      <button onClick={fetchSchedule}>Fetch Schedule</button>

      <h2>Total Rax: {totalRax}</h2>
      <ul>
        {schedule.map((s, i) => (
          <li key={i}>
            {s.date} | {s.matchup} | {s.score} | {s.type} | Winner: {s.winner} | Rax: {s.rax_earned}
          </li>
        ))}
      </ul>
    </div>
  );
}