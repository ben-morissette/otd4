import fetch from "node-fetch";

const RARITY_MULTIPLIERS = {
  General: 1, Common: 1.2, Uncommon: 1.4, Rare: 1.6,
  Epic: 2, Leg: 2.5, Mystic: 4, Iconic: 6
};

const SPORT_ENDPOINTS = {
  NFL: "football/nfl",
  NBA: "basketball/nba",
  NHL: "hockey/nhl"
};

export default async function handler(req, res) {
  const { sport, team, season, rarity } = req.query;

  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
  const baseUrl = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_ENDPOINTS[sport]}/teams/${team}/schedule?season=${season}&seasontype=2`;

  const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_ENDPOINTS[sport]}/teams/${team}/schedule?season=${season}&seasontype=3`;

  try {
    const response = await fetch(baseUrl);
    const scheduleData = await response.json();
    const playoffResponse = await fetch(playoffUrl);
    const playoffData = await playoffResponse.json();

    // Flatten events
    const events = [...(scheduleData.events || []), ...(playoffData.events || [])];

    const schedule = events.map((event) => {
      const competition = event.competitions?.[0];
      if (!competition) return null;
      const home = competition.competitors.find(c => c.homeAway === "home");
      const away = competition.competitors.find(c => c.homeAway === "away");

      const homeScore = Number(home?.score || 0);
      const awayScore = Number(away?.score || 0);

      let rax = 0;
      if (sport === "NFL") {
        if (homeScore > awayScore && home.team.abbreviation === team ||
            awayScore > homeScore && away.team.abbreviation === team) {
          rax = 100 + Math.abs(homeScore - awayScore) * 2;
        } else {
          rax = homeScore + awayScore <= 5 ? 5 : homeScore; // close game bonus
        }
      } else if (sport === "NBA") {
        rax = (homeScore > awayScore && home.team.abbreviation === team ||
               awayScore > homeScore && away.team.abbreviation === team)
               ? 2.5 * Math.abs(homeScore - awayScore) : 0;
      } else if (sport === "NHL") {
        rax = (homeScore > awayScore && home.team.abbreviation === team ||
               awayScore > homeScore && away.team.abbreviation === team)
               ? 12 * Math.abs(homeScore - awayScore) : 0;
      }

      rax *= rarityMultiplier;

      return {
        date: event.date,
        matchup: `${away.team.displayName} @ ${home.team.displayName}`,
        score: `${awayScore} - ${homeScore}`,
        type: event.seasonType === 3 ? "Playoffs" : "Regular",
        rax: rax.toFixed(2)
      };
    }).filter(Boolean);

    const totalRax = schedule.reduce((sum, g) => sum + Number(g.rax), 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}