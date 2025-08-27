import { useState, useEffect } from "react";
import axios from "axios";
import TeamSelect from "../components/TeamSelect";
import ScheduleTable from "../components/ScheduleTable";
import { calculateRax } from "../utils/rax";

const SPORTS = ["NHL", "NFL", "NBA"];

export default function Home() {
  const [sport, setSport] = useState("NHL");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState(null);
  const [season, setSeason] = useState(2024);
  const [rarity, setRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  // Fetch teams when sport changes
  useEffect(() => {
    if (!sport) return;
    const fetchTeams = async () => {
      try {
        const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/teams`;
        const { data } = await axios.get(url);
        const league = data.sports[0].leagues[0];
        const teamsList = league.teams.map((t) => ({
          value: t.team.abbreviation,
          label: t.team.displayName,
        }));
        setTeams(teamsList);
        setTeam(teamsList[0]?.value || null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
  }, [sport]);

  // Fetch schedule when team, sport, or season changes
  useEffect(() => {
    if (!team || !sport) return;
    const fetchSchedule = async () => {
      try {
        const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/teams/${team}/schedule?season=${season}&seasontype=2`;
        const { data } = await axios.get(url);
        const scheduleData = calculateRax(data, sport, rarity);
        setSchedule(scheduleData.schedule);
        setTotalRax(scheduleData.totalRax);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedule();
  }, [team, sport, season, rarity]);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#1a1a1a", color: "#fff", minHeight: "100vh" }}>
      <h1>Team Schedule Viewer</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>Sport:</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          {SPORTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <TeamSelect teams={teams} value={team} onChange={setTeam} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Season:</label>
        <input type="number" value={season} onChange={(e) => setSeason(Number(e.target.value))} min={2000} max={2100} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Rarity:</label>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          {Object.keys({ General: 1, Common: 1.2, Uncommon: 1.4, Rare: 1.6, Epic: 2, Leg: 2.5, Mystic: 4, Iconic: 6 }).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <h2>Total Rax Earned: {totalRax.toFixed(2)}</h2>
      <ScheduleTable data={schedule} />
    </div>
  );
}
