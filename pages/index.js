import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/globals.css";

const RARITY_MULTIPLIERS = {
  General: 1,
  Common: 1.2,
  Uncommon: 1.4,
  Rare: 1.6,
  Epic: 2,
  Leg: 2.5,
  Mystic: 4,
  Iconic: 6
};

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState(null);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await axios.get(`/api/teams?sport=${sport}`);
        setTeams(res.data);
        setTeam(Object.keys(res.data)[0] || "");
      } catch (e) {
        console.error(e);
      }
    }
    fetchTeams();
  }, [sport]);

  const getSchedule = async () => {
    // placeholder: call your schedule calculation API
    alert(
      `Fetch schedule for ${team} (${teams[team]}) ${season}, rarity: ${rarity}`
    );
  };

  return (
    <div className="container">
      <h1>Team Schedule Viewer</h1>
      <div className="input-group">
        <label>Sport:</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      <div className="input-group">
        <label>Team:</label>
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          {Object.keys(teams).map((abbr) => (
            <option key={abbr} value={abbr}>
              {teams[abbr]}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Season:</label>
        <input
          type="number"
          value={season}
          min={2000}
          max={2100}
          onChange={(e) => setSeason(Number(e.target.value))}
        />
      </div>

      <div className="input-group">
        <label>Rarity:</label>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <button onClick={getSchedule}>Get Schedule & Rax</button>

      {schedule && (
        <div>
          <h2>Total Rax Earned: {totalRax}</h2>
          {/* render schedule table here */}
        </div>
      )}

      <style jsx>{`
        .container {
          background-color: #121212;
          color: #fff;
          min-height: 100vh;
          padding: 2rem;
          font-family: Arial, sans-serif;
        }
        .input-group {
          margin-bottom: 1rem;
        }
        label {
          margin-right: 0.5rem;
        }
        select,
        input {
          padding: 0.3rem;
          border-radius: 4px;
          border: none;
        }
        button {
          padding: 0.5rem 1rem;
          border-radius: 5px;
          border: none;
          background-color: #6200ee;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background-color: #3700b3;
        }
      `}</style>
    </div>
  );
}
