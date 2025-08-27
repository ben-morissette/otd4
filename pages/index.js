import { useState } from "react";
import axios from "axios";

const TEAM_ABBREVIATIONS = [
  "NE", "DAL", "GB", "PIT", "SF", "KC", "LV", "BAL",
  "BUF", "SEA", "LA", "TB", "MIN", "TEN", "IND", "DEN",
  "CLE", "CIN", "PHI", "MIA", "NYG", "ARI", "DET", "ATL",
  "CAR", "JAC", "HOU", "NYJ", "WAS"
];

export default function Home() {
  const [team, setTeam] = useState("");
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTeamChange = async (e) => {
    const selectedTeam = e.target.value;
    setTeam(selectedTeam);
    setTeamData(null);

    if (!selectedTeam) return;

    setLoading(true);

    try {
      const response = await axios.get(`/api/team/${selectedTeam}`);
      setTeamData(response.data);
    } catch (error) {
      console.error("Error fetching team data:", error);
      setTeamData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Team Schedule Viewer</h1>

      <label>
        Select Sport: <strong>NFL</strong>
      </label>

      <br /><br />

      <label>
        Select Team: 
        <select value={team} onChange={handleTeamChange}>
          <option value="">-- Select a team --</option>
          {TEAM_ABBREVIATIONS.map((abbr) => (
            <option key={abbr} value={abbr}>
              {abbr}
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      {loading && <p>Loading team data...</p>}

      {teamData && (
        <div style={{ marginTop: "1rem" }}>
          <h2>{teamData.team.displayName}</h2>
          <p>Location: {teamData.team.location}</p>
          <p>Conference: {teamData.team.conference.name}</p>
          <p>Division: {teamData.team.division.name}</p>
        </div>
      )}
    </div>
  );
}
