import { useState, useEffect } from "react";
import SportSelector from "../components/SportSelector";
import SeasonSelector from "../components/SeasonSelector";
import TeamSelector from "../components/TeamSelector";
import ScheduleTable from "../components/ScheduleTable";

export default function Home() {
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [team, setTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (sport) {
      const fetchTeams = async () => {
        const res = await fetch(`/api/schedule?sport=${sport}`);
        const data = await res.json();
        setTeams(data.teams || []);
      };
      fetchTeams();
    }
  }, [sport]);

  useEffect(() => {
    if (sport && season && team) {
      const fetchSchedule = async () => {
        const res = await fetch(`/api/schedule?sport=${sport}&season=${season}&team=${team}`);
        const data = await res.json();
        setSchedule(data.schedule || []);
      };
      fetchSchedule();
    }
  }, [sport, season, team]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Game Schedule & RAX</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SportSelector sport={sport} setSport={setSport} />
        <SeasonSelector season={season} setSeason={setSeason} />
        <TeamSelector teams={teams} team={team} setTeam={setTeam} />
      </div>
      <ScheduleTable schedule={schedule} />
    </div>
  );
}