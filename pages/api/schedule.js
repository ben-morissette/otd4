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
  const { sport, team, season, rarity = "General" } = req.query;

  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  let baseUrl;
  switch (sport) {
    case "NFL":
      baseUrl = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule`;
      break;
    case "NHL":
      baseUrl = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule`;
      break;
    case "NBA":
      baseUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule`;
      break;
    default:
      return res.status(400).json({ error: "Invalid sport" });
  }

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  try {
    const regularRes = await fetch(`${baseUrl}?season=${season}&seasontype=2`);
    const regularData = await regularRes.json();

    const playoffRes = await fetch(`${baseUrl}?season=${season}&seasontype=3`);
    const playoffData = await playoffRes.json();

    const events = [
      ...(regularData.events || []),
      ...(playoffData.events || []).map((e) => ({ ...e, playoff: true })),
    ];

    const schedule = events.map((event) => {
      const competitors = event.competitions?.[0]?.competitors || [];
      const home = competitors.find((c) => c.homeAway === "home") || {};
      const away = competitors.find((c) => c.homeAway === "away") || {};

      const homeScore = Number(home.score || 0);
      const awayScore = Number(away.score || 0);
      const winner =
        homeScore > awayScore
          ? home.team.displayName
          : awayScore > homeScore
          ? away.team.displayName
          : "Tie";
      const loser =
        winner === "Tie"
          ? "Tie"
          : winner === home.team.displayName
          ? away.team.displayName
          : home.team.displayName;
      const margin = Math.abs(homeScore - awayScore);

      // Calculate Rax based on sport and playoff
      let rax = 0;
      if (sport === "NFL") {
        if (winner === home.team.displayName && winner === team) rax = 100 + margin * 2;
        else if (winner === away.team.displayName && winner === team) rax = 100 + margin * 2;
        else rax = homeScore + awayScore <= 5 ? 5 : homeScore; // simplified close game bonus
      } else if (sport === "NHL") {
        if (winner === team) rax = event.playoff ? 20 + 20 * margin : 12 * margin;
      } else if (sport === "NBA") {
        if (winner === team) rax = event.playoff ? 30 + margin : 2.5 * margin;
      }

      rax *= rarityMultiplier;

      return {
        date: event.date,
        name: `${away.team.displayName} at ${home.team.displayName}`,
        Score: `${awayScore} - ${homeScore}`,
        type: event.playoff ? "Playoffs" : "Regular Season",
        "W/L": winner === team ? "W" : winner === "Tie" ? "Tie" : "L",
        rax_earned: rax.toFixed(2),
      };
    });

    const total_rax = schedule.reduce((sum, s) => sum + parseFloat(s.rax_earned), 0);

    res.status(200).json({ schedule, total_rax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}