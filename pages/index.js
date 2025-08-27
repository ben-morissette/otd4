import { useEffect, useState } from "react";

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
  const [teamsList, setTeamsList] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("");
  const [rarity, setRarity] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(null);

  // Fetch teams whenever sport changes
  useEffect(() => {
    setTeam("");
    setTeamsList({});
    if (!sport) return;

    const fetchTeams = async () => {
      try {
        const res = await fetch(`/api/teams?sport=${sport}`);
        const data = await res.json();
        setTeamsList(data);
      } catch (err) {
        console.error(err);
        setTeamsList({});
      }
    };

    fetchTeams();
  }, [sport]);

  const handleGetSchedule = async () => {
    if (!sport || !team || !season || !rarity) return;

    try {
      const res = await fetch(
        `/api/schedule?sport=${sport}&team=${team}&season=${season}&rarity=${rarity}`
      );
      const data = await res.json();
      setSchedule(data.schedule);
      setTotalRax(data.totalRax);
    } catch (err) {
      console.error(err);
      setSchedule([]);
      setTotalRax(null);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Team Schedule Viewer</h1>

      {/* Sport selector */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Select Sport:{" "}
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            <option value="" disabled>
              --Choose Sport--
            </option>
            <option value="NHL">NHL</option>
            <option value="NFL">NFL</option>
            <option value="NBA">NBA</option>
          </select>
        </label>
      </div>

      {/* Team selector */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Select Team:{" "}
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            disabled={!teamsList || Object.keys(teamsList).length === 0}
          >
            <option value="" disabled>
              --Choose Team--
            </option>
            {teamsList &&
              Object.keys(teamsList).map((abbr) => (
                <option key={abbr} value={abbr}>
                  {teamsList[abbr]}
                </option>
              ))}
          </select>
        </label>
      </div>

      {/* Season input */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Season:{" "}
          <input
            type="number"
            min="2000"
            max="2100"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={!team}
            placeholder="e.g. 2024"
          />
        </label>
      </div>

      {/* Rarity selector */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Rarity:{" "}
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            disabled={!season}
          >
            <option value="" disabled>
              --Choose Rarity--
            </option>
            {Object.keys(RARITY_MULTIPLIERS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Get Schedule button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleGetSchedule}
          disabled={!sport || !team || !season || !rarity}
        >
          Get Schedule
        </button>
      </div>

      {/* Display total Rax */}
      {totalRax !== null && (
        <div style={{ marginBottom: "15px" }}>
          <strong>Total Rax Earned: </strong> {totalRax.toFixed(2)}
        </div>
      )}

      {/* Display schedule table */}
      {schedule.length > 0 && (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              {Object.keys(schedule[0]).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
