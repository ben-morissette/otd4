import React, { useEffect, useState } from "react";

export default function TeamSelector({ sport, team, setTeam }) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!sport) return;

    const fetchTeams = async () => {
      let url;
      if (sport === "NFL") url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      if (sport === "NBA") url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
      if (sport === "NHL") url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";

      const res = await fetch(url);
      const data = await res.json();

      const leagueTeams =
        data.sports?.[0]?.leagues?.[0]?.teams?.map(t => ({
          abbr: t.team.abbreviation,
          name: t.team.displayName
        })) || [];

      setTeams(leagueTeams);
    };

    fetchTeams();
  }, [sport]);

  return (
    <div>
      <label htmlFor="team">Select Team:</label>
      <select
        id="team"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      >
        <option value="">--Choose Team--</option>
        {teams.map((t) => (
          <option key={t.abbr} value={t.abbr}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}