import { useState, useEffect } from "react";
import axios from "axios";

const SPORTS = ["NHL", "NFL", "NBA"];

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`/api/teams?sport=${sport}`);
        setTeams(res.data);

        const firstTeam = Object.keys(res.data)[0];
        if (firstTeam) setTeam(firstTeam);
      } catch (err) {
        console.error("Failed to fetch teams", err);
        setTeams({});
      }
    };
    fetchTeams();
  }, [sport]);

  return (
    <div style={{ backgroundColor: "#1e1e1e", color: "#fff", minHeight: "100vh", padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          {SPORTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Team: </label>
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          {Object.entries(teams).map(([abbr, name]) => (
            <option key={abbr} value={abbr}>{name}</option>
          ))}
        </select>
      </div>

      <p>Selected Sport: {sport}</p>
      <p>Selected Team: {teams[team]}</p>
    </div>
  );
}
