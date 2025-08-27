// pages/api/schedule.js
export default async function handler(req, res) {
  const { sport, team, season, rarity } = req.query;
  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const RARITY_MULTIPLIERS = {
    General: 1, Common: 1.2, Uncommon: 1.4, Rare: 1.6,
    Epic: 2, Leg: 2.5, Mystic: 4, Iconic: 6
  };

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  const urls = {
    NHL: `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`,
    NFL: `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`,
    NBA: `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`,
  };

  try {
    const response = await fetch(urls[sport]);
    const data = await response.json();

    // Simple transformation to include "W/L" and RAX calculation
    const schedule = (data.events || []).map((event) => {
      const home = event.competitions[0].competitors.find(c => c.homeAway === "home");
      const away = event.competitions[0].competitors.find(c => c.homeAway === "away");

      const homeScore = home?.score || 0;
      const awayScore = away?.score || 0;

      let winner = "";
      if (homeScore > awayScore) winner = home.team.displayName;
      else if (awayScore > homeScore) winner = away.team.displayName;
      else winner = "Tie";

      const margin = Math.abs(homeScore - awayScore);
      const baseRax = winner === team ? margin * 10 : 0;
      const rax = baseRax * rarityMultiplier;

      return {
        date: event.date,
        matchup: event.name,
        score: `${awayScore} - ${homeScore}`,
        winner,
        margin_of_victory: margin,
        rax_earned: rax,
        W_L: winner === team ? "W" : winner === "Tie" ? "T" : "L",
      };
    });

    const totalRax = schedule.reduce((sum, g) => sum + g.rax_earned, 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
