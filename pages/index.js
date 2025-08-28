import { useEffect, useState } from "react";

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [team, setTeam] = useState("");
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [schedule, setSchedule] = useState([]);

  // Load seasons based on sport
  useEffect(() => {
    if (!sport) {
      setSeasons([]);
      setSeason("");
      setTeams([]);
      setTeam("");
      return;
    }
    if (sport === "nba") {
      setSeasons([2024, 2023, 2022]); // Example NBA seasons
    } else if (sport === "nfl") {
      setSeasons([2024, 2023, 2022]); // Example NFL seasons
    } else if (sport === "nhl") {
      setSeasons([2024, 2023, 2022]); // Example NHL seasons
    }
    setSeason("");
    setTeams([]);
    setTeam("");
    setSchedule([]);
  }, [sport]);

  // Fetch teams when sport & season selected
  useEffect(() => {
    const fetchTeams = async () => {
      if (!sport || !season) return;
      try {
        const res = await fetch(`/api/teams?sport=${sport}&season=${season}`);
        const data = await res.json();
        setTeams(data);
        setTeam("");
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, [sport, season]);

  // Fetch schedule when team is selected
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!sport || !season || !team) return;
      try {
        const res = await fetch(`/api/schedule?sport=${sport}&season=${season}&team=${team}`);
        const data = await res.json();
        setSchedule(data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };
    fetchSchedule();
  }, [sport, season, team]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Team Schedule & RAX</h1>

      <div className="flex gap-4 mb-6">
        {/* Sport Selector */}
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Select Sport</option>
          <option value="nba">NBA</option>
          <option value="nfl">NFL</option>
          <option value="nhl">NHL</option>
        </select>

        {/* Season Selector */}
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="border rounded p-2"
          disabled={!seasons.length}
        >
          <option value="">Select Season</option>
          {seasons.map((yr) => (
            <option key={yr} value={yr}>
              {yr} - {yr + 1}
            </option>
          ))}
        </select>

        {/* Team Selector */}
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="border rounded p-2"
          disabled={!teams.length}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Table */}
      {schedule.length > 0 ? (
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Matchup</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Result</th>
              <th className="border p-2">RAX</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((game, idx) => (
              <tr key={idx}>
                <td className="border p-2">{new Date(game.date).toLocaleString()}</td>
                <td className="border p-2">{game.matchup || "TBD"}</td>
                <td className="border p-2">
                  {game.homeScore != null && game.awayScore != null
                    ? `${game.homeScore} - ${game.awayScore}`
                    : "TBD"}
                </td>
                <td className="border p-2">{game.result || "Pending"}</td>
                <td className="border p-2">{game.rax?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">Select options to view schedule.</p>
      )}
    </div>
  );
}