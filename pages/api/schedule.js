import fetch from "node-fetch";

const RARITY_MULTIPLIERS = {
  General: 1,
  Common: 1.2,
  Uncommon: 1.4,
  Rare: 1.6,
  Epic: 2,
  Leg: 2.5,
  Mystic: 4,
  Iconic: 6
};

export default async function handler(req, res) {
  const { sport, team, season, rarity } = req.query;

  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing sport, team, or season parameter." });
  }

  let url;
  if (sport === "NHL") {
    url = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`;
  } else if (sport === "NFL") {
    url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`;
  } else if (sport === "NBA") {
    url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;
  } else {
    return res.status(400).json({ error: "Invalid sport" });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

    const schedule = (data.events || []).map(event => {
      const competition = event.competitions?.[0];
      const home = competition?.competitors.find(c => c.homeAway === "home");
      const away = competition?.competitors.find(c => c.homeAway === "away");

      const homeScore = home?.score?.value || 0;
      const awayScore = away?.score?.value || 0;

      let winner = homeScore > awayScore ? home.team.displayName :
                   awayScore > homeScore ? away.team.displayName : "Tie";

      let rax = 0;
      if (winner === team) {
        rax = Math.abs(homeScore - awayScore) * 10 * rarityMultiplier;
      }

      return {
        date: event.date,
        name: event.name,
        type: "Regular Season",
        Score: `${awayScore} - ${homeScore}`,
        "W/L": winner === "Tie" ? "" : winner === team ? "W" : "L",
        rax_earned: rax
      };
    });

    const totalRax = schedule.reduce((acc, g) => acc + (g.rax_earned || 0), 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
