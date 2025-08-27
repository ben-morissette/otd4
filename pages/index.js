import { useEffect, useState } from "react";
import axios from "axios";

const RARITY_MULTIPLIERS = {
  "General": 1,
  "Common": 1.2,
  "Uncommon": 1.4,
  "Rare": 1.6,
  "Epic": 2,
  "Leg": 2.5,
  "Mystic": 4,
  "Iconic": 6,
};

const SPORTS_API_PATHS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      try {
        const url = `http://site.api.espn.com/apis/site/v2/sports/${SPORTS_API_PATHS[sport]}/teams`;
        const res = await axios.get(url);
        const data = res.data;

        const fetchedTeams = {};
        const teamsArray =
          data?.sports?.[0]?.leagues?.[0]?.teams || [];
        teamsArray.forEach((t) => {
          const abbr = t.team.abbreviation;
          const name = t.team.displayName;
          fetchedTeams[abbr] = name;
        });
        setTeams(fetchedTeams);
        setTeam(Object.keys(fetchedTeams)[0] || "");
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [sport]);

  const handleSportChange = (e) => setSport(e.target.value);
  const handleTeamChange = (e) => setTeam(e.target.value);
  const handleSeasonChange = (e) => setSeason(Number(e.target.value));
  const handleRarityChange = (e) => setRarity(e.target.value);

  return (
    <div style={{ padding: 20, backgroundColor: "#121212", minHeight: "100vh" }}>
      <h1 style={{ color: "#f0f0f0" }}>Team Schedule Viewer</h1>

      <label style={{ marginRight: 10 }}>Select Sport:</label>
      <select value={sport} onChange={handleSportChange}>
        {Object.keys(SPORTS_API_PATHS).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <br /><br />

      {loading ? (
        <p>Loading teams...</p>
      ) : (
        <>
          <label style={{ marginRight: 10 }}>Select Team:</label>
          <select value={team} onChange={handleTeamChange}>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}

      <br /><br />

      <label>Season:</label>
      <input
        type="number"
        value={season}
        min={2000}
        max={2100}
        onChange={handleSeasonChange}
      />

      <br /><br />

      <label>Rarity:</label>
      <select value={rarity} onChange={handleRarityChange}>
        {Object.keys(RARITY_MULTIPLIERS).map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <br /><br />

      <p style={{ color: "#f0f0f0" }}>
        Selected: {sport} - {teams[team]} ({team}) - {season} - {rarity}
      </p>
    </div>
  );
}
