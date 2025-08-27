import React, { useState, useEffect } from "react";
import SportsSelect from "../components/SportsSelect";
import TeamSelect from "../components/TeamSelect";
import YearSelect from "../components/YearSelect";
import RaxDisplay from "../components/RaxDisplay";
import { calculateRax } from "../utils/rax";

export default function Home() {
  const [sport, setSport] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [teamSchedule, setTeamSchedule] = useState([]);
  const [rax, setRax] = useState(0);

  useEffect(() => {
    if (team && year) {
      const url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${year}&seasontype=2`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const schedule = data.events.map((e) => ({
            win: e.competitions[0].competitors[0].homeTeamScore >
                 e.competitions[0].competitors[1].awayTeamScore
          }));
          setTeamSchedule(schedule);
          setRax(calculateRax(schedule));
        });
    }
  }, [team, year]);

  return (
    <div>
      <h1>Team Schedule Viewer</h1>
      <SportsSelect selectedSport={sport} onChange={setSport} />
      <TeamSelect sport={sport} selectedTeam={team} onChange={setTeam} />
      <YearSelect selectedYear={year} onChange={setYear} />
      <RaxDisplay rax={rax} />
    </div>
  );
}
