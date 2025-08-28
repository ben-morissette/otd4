import { useEffect, useState } from "react";
import TeamSelector from "../components/TeamSelector";
import SeasonSelector from "../components/SeasonSelector";
import ScheduleTable from "../components/ScheduleTable";

export default function Home() {
  const [sport, setSport] = useState("");
  const [teams, setTeams] = useState({});
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [schedule, setSchedule] = useState([]);
  const [totalRax, setTotalRax] = useState(0);

  useEffect(() => {
    if (sport) {
      fetch(`/api/teams?sport=${sport}`)
        .then(r => r.json())
        .then(data => {
          setTeams(data.teams || {});
          setTeam("");
          setSchedule([]);
        });
    }
  }, [sport]);

  useEffect(() => {
    if (sport && team) {
      fetch(`/api/schedule?sport=${sport}&team=${team}&season=${season}`)
        .then(r => r.json())
        .then(data => {
          setSchedule(data.schedule || []);
          setTotalRax(data.totalRax || 0);
        });
    }
  }, [sport, team, season]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>

      <div>
        <label>Sport: </label>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          <option value="">Select Sport</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="NBA">NBA</option>
        </select>
      </div>

      {sport && (
        <>
          <TeamSelector teams={teams} team={team} setTeam={setTeam} />
          <SeasonSelector season={season} setSeason={setSeason} />
        </>
      )}

      <ScheduleTable schedule={schedule} totalRax={totalRax} />
    </div>
  );
}