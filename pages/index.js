import { useState, useEffect } from "react";
import TeamSelector from "../components/TeamSelector";
import ScheduleTable from "../components/ScheduleTable";
import { getTeams, getScheduleWithRax } from "../utils/api";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    if (sport) {
      getTeams(sport).then((data) => setTeams(data));
      setTeam(""); // reset team selection when sport changes
      setSchedule([]);
      setTotalRax(0);
    }
  }, [sport]);

  useEffect(() => {
    if (team && sport) {
      getScheduleWithRax(sport, team, season).then(({ schedule, totalRax }) => {
        setSchedule(schedule);
        setTotalRax(totalRax);
      });
    }
  }, [team, sport, season]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>

      <div style={{ margin: "1rem 0" }}>
        <label>Select Sport: </label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">--Choose Sport--</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      {sport && (
        <TeamSelector
          teams={teams}
          selectedTeam={team}
          onChangeTeam={setTeam}
        />
      )}

      {sport && (
        <div style={{ margin: "1rem 0" }}>
          <label>Season: </label>
          <input
            type="number"
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value))}
          />
        </div>
      )}

      {schedule.length > 0 && (
        <>
          <h2>Total Rax Earned: {totalRax}</h2>
          <ScheduleTable schedule={schedule} />
        </>
      )}
    </div>
  );
}