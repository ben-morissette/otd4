const SPORT_ENDPOINTS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export async function getTeams(sport) {
  if (!sport) return [];
  const url = `https://site.api.espn.com/apis/site/v2/sports/${SPORT_ENDPOINTS[sport]}/teams`;
  const res = await fetch(url);
  const data = await res.json();

  const teams = data.sports[0].leagues[0].teams.map((t) => ({
    abbreviation: t.team.abbreviation,
    name: t.team.displayName,
  }));

  return teams;
}

export async function getScheduleWithRax(sport, teamAbbr, season) {
  const regUrl = `https://site.api.espn.com/apis/site/v2/sports/${SPORT_ENDPOINTS[sport]}/teams/${teamAbbr}/schedule?season=${season}&seasontype=2`;
  const playoffUrl = `https://site.api.espn.com/apis/site/v2/sports/${SPORT_ENDPOINTS[sport]}/teams/${teamAbbr}/schedule?season=${season}&seasontype=3`;

  const normalizeScore = (score) => {
    if (!score) return 0;
    if (typeof score === "number") return score;
    if (score.value) return parseInt(score.value);
    return 0;
  };

  const res = await fetch(regUrl);
  const data = await res.json();
  const events = data.events || [];

  const playoffRes = await fetch(playoffUrl);
  const playoffData = await playoffRes.json();
  const playoffEvents = playoffData.events || [];

  const allEvents = [...events, ...playoffEvents];

  let totalRax = 0;
  const schedule = allEvents.map((event) => {
    const comp = event.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");

    const homeScore = normalizeScore(home.score);
    const awayScore = normalizeScore(away.score);

    const winner =
      homeScore > awayScore
        ? home.team.displayName
        : awayScore > homeScore
        ? away.team.displayName
        : "Tie";

    const margin = Math.abs(homeScore - awayScore);

    // Rax rules simplified (NHL example)
    let rax = 0;
    if (sport === "NHL") {
      if (winner === home.team.displayName && teamAbbr === home.team.abbreviation) rax = 12 * margin;
      else if (winner === away.team.displayName && teamAbbr === away.team.abbreviation) rax = 12 * margin;
    }
    // You can extend NFL/NBA Rax rules here

    totalRax += rax;

    return {
      date: new Date(event.date).toLocaleString(),
      matchup: `${away.team.displayName} @ ${home.team.displayName}`,
      homeScore,
      awayScore,
      winner,
      margin,
      rax,
    };
  });

  return { schedule, totalRax };
}