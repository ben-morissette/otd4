import { useEffect, useState } from "react";

export default function Home() {
  const [sport, setSport] = useState();
  const [team, setTeam] = useState();
  const [season, setSeason] = useState();
  const [rarity, setRarity] = useState();
  const [teamsList, setTeamsList] = useState();
  const [schedule, setSchedule] = useState();
  const [totalRax, setTotalRax] = useState();

  const RARITY_MULTIPLIERS = {
    General: 1,
    Common: 1.2,
    Uncommon: 1.4,
    Rare: 1.6,
    Epic: 2,
    Leg: 2.5,
    Mystic: 4,
    Iconic: 6,
  };

  // Fetch teams based on sport
  useEffect(() => {
    if (!sport) return;

    async function fetchTeams() {
      let url = "";
      if (sport === "NHL")
        url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
      if (sport === "NFL")
        url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      if (sport === "NBA")
        url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

      const res = await fetch(url);
      const data = await res.json();
      const teams = {};
      data.sports[0].leagues[0].teams.forEach((t) => {
        teams[t.team.abbreviation] = t.team.displayName;
      });
      setTeamsList(teams);
      setTeam(); // clear selected team when sport changes
    }

    fetchTeams();
  }, [sport]);

  // Fetch schedule when all required fields are selected
  useEffect(() => {
    if (!sport || !team || !season || !rarity) return;

    async function fetchSchedule() {
      let url = "";
      let playoffUrl = "";
      if (sport === "NHL")
        url = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`;
      if (sport === "NFL")
        url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`;
      if (sport === "NBA")
        url = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;

      playoffUrl = url.replace("seasontype=2", "seasontype=3");

      const res = await fetch(url);
      const playoffRes = await fetch(playoffUrl);
      const data = await res.json();
      const playoffData = await playoffRes.json();

      if (!data.team || !data.team.displayName) {
        setSchedule([]);
        setTotalRax(0);
        return;
      }

      const teamName = data.team.displayName;
      const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

      const scheduleList = [];

      function processEvents(events, type) {
        if (!events) return;
        events.forEach((event) => {
          let homeScore = "";
          let awayScore = "";
          event.competitions?.forEach((competition) => {
            competition.competitors?.forEach((c) => {
              if (c.homeAway === "home") homeScore = c.score;
              else awayScore = c.score;
            });
          });

          const homeVal = typeof homeScore === "object" ? homeScore.value || 0 : homeScore || 0;
          const awayVal = typeof awayScore === "object" ? awayScore.value || 0 : awayScore || 0;
          let winner = "Tie";
          let loser = "Tie";
          if (homeVal > awayVal) {
            winner = event.name.split(" at ")[1] || "";
            loser = event.name.split(" at ")[0] || "";
          } else if (awayVal > homeVal) {
            winner = event.name.split(" at ")[0] || "";
            loser = event.name.split(" at ")[1] || "";
          }

          const margin = Math.abs(homeVal - awayVal);
          const baseRax = winner === teamName ? (type === "Playoffs" ? 20 + 20 * margin : 12 * margin) : 0;

          scheduleList.push({
            date: event.date || "",
            name: event.name || "",
            type,
            Score: `${awayVal} - ${homeVal}`,
            "W/L": winner === teamName ? "W" : loser === teamName ? "L" : "",
            rax_earned: baseRax * rarityMultiplier,
          });
        });
      }

      processEvents(data.events, "Regular Season");
      processEvents(playoffData.events, "Playoffs");

      setSchedule(scheduleList);
      setTotalRax(scheduleList.reduce((sum, row) => sum + (row.rax_earned || 0), 0));
    }

    fetchSchedule();
  }, [sport, team, season, rarity]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Team Schedule Viewer</h1>

      {/* Sport selector */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Select Sport:{" "}
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="" disabled>
              --Choose Sport--
            </option>
            <option value="NHL">NHL</option>
            <option value="NFL">NFL</option>
            <option value="NBA">NBA</option>
          </select>
        </label>
      </div>

      {/* Team selector */}
      {teamsList && Object.keys(teamsList).length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <label>
            Select Team:{" "}
            <select value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="" disabled>
                --Choose Team--
              </option>
              {Object.keys(teamsList).map((abbr) => (
                <option key={abbr} value={abbr}>
                  {teamsList[abbr]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Season input */}
      {team && (
        <div style={{ marginBottom: "15px" }}>
          <label>
            Season (e.g., 2024):{" "}
            <input
              type="number"
              min="2000"
              max="2100"
              value={season || ""}
              onChange={(e) => setSeason(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Rarity selector */}
      {season && (
        <div style={{ marginBottom: "15px" }}>
          <label>
            Rarity:{" "}
            <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option value="" disabled>
                --Choose Rarity--
              </option>
              {Object.keys(RARITY_MULTIPLIERS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Total Rax */}
      {schedule && schedule.length > 0 && (
        <div style={{ marginTop: "20px", marginBottom: "10px" }}>
          <strong>Total Rax Earned: {totalRax.toFixed(2)}</strong>
        </div>
      )}

      {/* Schedule table */}
      {schedule && schedule.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Score</th>
              <th>Type</th>
              <th>W/L</th>
              <th>Rax Earned</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>{row.name}</td>
                <td>{row.Score}</td>
                <td>{row.type}</td>
                <td>{row["W/L"]}</td>
                <td>{row.rax_earned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
