const SPORT_ENDPOINTS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

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

export async function getScheduleWithRax(sport, teamAbbr, season, rarity = "General") {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
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

    // --- RAX Calculation ---
    let rax = 0;

    if (sport === "NHL") {
      if (winner === home.team.displayName && teamAbbr === home.team.abbreviation) rax = 12 * margin;
      else if (winner === away.team.displayName && teamAbbr === away.team.abbreviation) rax = 12 * margin;

      // Playoff bonus
      if (event.seasonType === 3 && winner === home.team.displayName && teamAbbr === home.team.abbreviation)
        rax = 20 + 20 * margin;
      else if (event.seasonType === 3 && winner === away.team.displayName && teamAbbr === away.team.abbreviation)
        rax = 20 + 20 * margin;
    }

    if (sport === "NFL") {
      const teamScore =
        teamAbbr === home.team.abbreviation ? homeScore : awayScore;

      if (winner === home.team.displayName && teamAbbr === home.team.abbreviation)
        rax = 100 + 2 * margin;
      else if (winner === away.team.displayName && teamAbbr === away.team.abbreviation)
        rax = 100 + 2 * margin;
      else rax = teamScore + 5; // loss + close game bonus
    }

    if (sport === "NBA") {
      if (winner === home.team.displayName && teamAbbr === home.team.abbreviation) {
        rax = event.seasonType === 3 ? 30 + margin : 2.5 * margin;
      } else if (winner === away.team.displayName && teamAbbr === away.team.abbreviation) {
        rax = event.seasonType === 3 ? 30 + margin : 2.5 * margin;
      } else rax = 0; // Loss
    }

    rax *= rarityMultiplier;
    totalRax += rax;

    return {
      date: new Date(event.date).toLocaleString(),
      matchup: `${away.team.displayName} @ ${home.team.displayName}`,
      homeScore,
      awayScore,
      winner,
      margin,
      rax: rax.toFixed(2),
    };
  });

  return { schedule, totalRax: totalRax.toFixed(2) };
}