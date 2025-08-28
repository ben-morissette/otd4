import { useState, useEffect } from "react";
import SportSelector from "../components/SportSelector";
import SeasonSelector from "../components/SeasonSelector";
import TeamSelector from "../components/TeamSelector";
import ScheduleTable from "../components/ScheduleTable";
import { fetchSports, fetchSeasons, fetchTeams, fetchSchedule } from "../lib/espnApi";

export default function Home() {
  const [sports, setSports] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    fetchSports().then(setSports);
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchSeasons(selectedSport).then(setSeasons);
    }
  }, [selectedSport]);

  useEffect(() => {
    if (selectedSport && selectedSeason) {
      fetchTeams(selectedSport, selectedSeason).then(setTeams);
    }
  }, [selectedSport, selectedSeason]);

  useEffect(() => {
    if (selectedSport && selectedSeason && selectedTeam) {
      fetchSchedule(selectedSport, selectedSeason, selectedTeam).then(setSchedule);
    }
  }, [selectedSport, selectedSeason, selectedTeam]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Schedule & RAX</h1>
      <div className="flex gap-4 mb-6">
        <SportSelector
          sports={sports}
          selectedSport={selectedSport}
          onChange={setSelectedSport}
        />
        <SeasonSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          onChange={setSelectedSeason}
        />
        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          onChange={setSelectedTeam}
        />
      </div>
      <ScheduleTable schedule={schedule} />
    </div>
  );
}