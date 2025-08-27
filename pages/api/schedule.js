import fetch from "node-fetch";

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

export default async function handler(req, res) {
  const { sport, team, season, rarity } = req.query;
  if (!sport || !team || !season || !rarity) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  const urls = {
    NHL: `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`,
    NFL: `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`,
    NBA: `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`,
  };

  try {
    const response = await fetch(urls[sport]);
    const data = await response.json();

    const schedule = data.events.map((event) => {
      let home = "";
      let away = "";
      let homeScore = 0;
      let awayScore = 0;

      event.competitions[0].competitors.forEach((c) => {
        if (c.homeAway === "home") {
          home = c.team.displayName;
          homeScore = parseInt(c.score || 0);
        } else {
          away = c.team.displayName;
          awayScore = parseInt(c.score || 0);
        }
      });

      const winner =
        homeScore > awayScore ? home : awayScore > homeScore ? away : "Tie";

      const baseRax = winner === team ? 10 + Math.abs(homeScore - awayScore) : 0;
      const rax_earned = baseRax * rarityMultiplier;

      return {
        date: event.date,
        name: event.name,
        home,
        away,
        Score: `${awayScore} - ${homeScore}`,
        winner,
        rax_earned,
      };
    });

    const totalRax = schedule.reduce((sum, g) => sum + g.rax_earned, 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
