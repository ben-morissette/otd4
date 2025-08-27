import { useEffect, useState } from "react";
import { getTeams, calculateNHLRax, calculateNFLRax, calculateNBARax, RARITY_MULTIPLIERS } from "../lib/api";

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("2024");
  const [rarity, setRarity] = useState("General");
  const [rax, setRax] = useState(0);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getTeams(sport);
      setTeams(data);
      setTeam(Object.keys(data)[0] || "");
    }
    fetchTeams();
  }, [sport]);

  const handleCalculate = () => {
    // Demo logic: in real app fetch schedule + calculate based on actual scores
    let total = 0;
    if (sport === "NHL") total = calculateNHLRax(3, false, rarity);
    if (sport === "NFL") total = calculateNFLRax(20, 7, true, rarity);
    if (sport === "NBA") total = calculateNBARax(8, false, rarity);
    setRax(total.toFixed(2));
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Team Cards Rax Calculator</h1>

      <div>
        <label>Sport:</label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option>NHL</option>
          <option>NFL</option>
          <option>NBA</option>
        </select>
      </div>

      <div>
        <label>Team:</label>
        <select value={team} onChange={e => setTeam(e.target.value)}>
          {Object.keys(teams).map(abbr => (
            <option key={abbr} value={abbr}>{teams[abbr]}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Season:</label>
        <select value={season} onChange={e => setSeason(e.target.value)}>
          {Array.from({ length: 10 }, (_, i) => 2022 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Rarity:</label>
        <select value={rarity} onChange={e => setRarity(e.target.value)}>
          {Object.keys(RARITY_MULTIPLIERS).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <button onClick={handleCalculate} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        Calculate Rax
      </button>

      <h2>Total Rax: {rax}</h2>
    </div>
  );
}
