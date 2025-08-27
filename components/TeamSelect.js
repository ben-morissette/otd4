import React, { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TeamSelect({ sport, selectedTeam, onChange }) {
  const [teams, setTeams] = useState([]);

  const { data } = useSWR(
    sport ? `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams` : null,
    fetcher
  );

  useEffect(() => {
    if (data) {
      const mapped = data.sports[0].leagues[0].teams.map((team) => ({
        name: team.team.displayName,
        abbreviation: team.team.abbreviation
      }));
      setTeams(mapped);
    }
  }, [data]);

  return (
    <select value={selectedTeam} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Team</option>
      {teams.map((team) => (
        <option key={team.abbreviation} value={team.abbreviation}>
          {team.name}
        </option>
      ))}
    </select>
  );
}
