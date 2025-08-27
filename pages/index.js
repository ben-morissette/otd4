import { useEffect, useState } from "react";
import axios from "axios";
import Dropdown from "../components/Dropdown";
import ScheduleTable from "../components/ScheduleTable";
import { calculateRax } from "../utils/raxUtil";

export default function Home() {
  const sports = ["NHL", "NFL", "NBA", "CFB", "CBB"];
  const rarities = ["General", "Common", "Uncommon", "Rare", "Epic", "Leg", "Mystic", "Iconic"];

  const [selectedSport, setSelectedSport] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [selectedRarity, setSelectedRarity] = useState("General");
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (!selectedSport) return;

    const fetchTeams = async () => {
      let sportPath = selectedSport.toLowerCase();
      if (selectedSport === "CFB" || selectedSport === "CBB") sportPath = "mens-college-basketball";

      const url = `http://site.api.espn.com/apis/site/v2/sports/${sportPath}/teams`;
      const res = await axios.get(url);
      const allTeams = res.data.sports[0].leagues[0].teams.map(t => ({
        displayName: t.team.displayName,
        abbreviation: t.team.abbreviation
      }));
      setTeams(allTeams);
    };
    fetchTeams();
  }, [selectedSport]);

  useEffect(() => {
    if (!selectedTeam) return;

    const fetchSchedule = async () => {
      const url = `http://site.api.espn.com/apis/site/v2/sports/${selectedSport.toLowerCase()}/${selectedTeam}/schedule?season=${season}&seasontype=2`;
      try {
        const res = await axios.get(url);
        const games = res.data.events.map(ev => {
          const homeTeam = ev.competitions[0].competitors.find(c => c.homeAway === "home");
          const awayTeam = ev.competitions[0].competitors.find(c => c.homeAway === "away");

          return {
            date: ev.date,
            opponent: homeTeam.team.displayName === selectedTeam ? awayTeam.team.displayName : homeTeam.team.displayName,
            location: homeTeam.team.displayName === selectedTeam ? "Home" : "Away",
            homeScore: homeTeam.score,
            awayScore: awayTeam.score,
            type: ev.season.type === 2 ? "Playoffs" : "Regular",
            homeTeam: homeTeam.team.displayName,
            awayTeam: awayTeam.team.displayName,
            rax: calculateRax({
              homeScore: { value: homeTeam.score },
              awayScore: { value: awayTeam.score },
              homeTeam: homeTeam.team.displayName,
              awayTeam: awayTeam.team.displayName,
              type: ev.season.type === 2 ? "Playoffs" : "Regular"
            }, selectedTeam, selectedRarity, selectedSport)
          };
        });
        setSchedule(games);
      } catch (err) {
        console.error(err);
        setSchedule([]);
      }
    };

    fetchSchedule();
  }, [selectedTeam, season, selectedSport, selectedRarity]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Team Schedule Viewer</h1>
      <Dropdown label="Select Sport" options={sports} value={selectedSport} onChange={setSelectedSport} />
      <Dropdown label="Select Team" options={teams} value={selectedTeam} onChange={setSelectedTeam} />
      <Dropdown label="Season" options={[2024, 2025]} value={season} onChange={setSeason} />
      <Dropdown label="Rarity" options={rarities} value={selectedRarity} onChange={setSelectedRarity} />

      <h2>Selected: {selectedSport} - {selectedTeam} - {season} - {selectedRarity}</h2>

      <ScheduleTable schedule={schedule} />
    </div>
  );
}
