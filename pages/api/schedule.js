import fetch from "node-fetch";

// Rax multipliers and rules (simplified version for demo)
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

// Sport-specific Rax calculation rules
function calculateRax(sport, game, teamId) {
  let base = 0;
  const teamScore = game.competitions[0].competitors.find(c => c.team.id === teamId)?.score || 0;
  const oppScore = game.competitions[0].competitors.find(c => c.team.id !== teamId)?.score || 0;
  const margin = teamScore - oppScore;

  switch (sport) {
    case "NFL":
      if (margin > 0) return 100 + margin * 2; // win
      else return teamScore + 5; // loss
    case "NHL":
      if (margin > 0) return margin * 12; // win
      else return 0;
    case "NBA":
      if (margin > 0) return margin * 2.5; // win
      else return 0;
    default:
      return 0;
  }
}

export default async function handler(req, res) {
  const { sport, teamId, season } = req.query;

  if (!sport || !teamId || !season) {
    return res.status(400).json({ error: "Missing sport, teamId, or season" });
  }

  try {
    const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport.toLowerCase()}/teams/${teamId}/schedule?season=${season}&seasontype=2`;
    const response = await fetch(url);
    const data = await response.json();

    const schedule = data.events.map(game => {
      const home = game.competitions[0].competitors.find(c => c.homeAway === "home");
      const away = game.competitions[0].competitors.find(c => c.homeAway === "away");

      const rax = calculateRax(sport, game, teamId);

      return {
        date: game.date,
        name: game.name,
        homeTeam: home.team.displayName,
        awayTeam: away.team.displayName,
        homeScore: home.score,
        awayScore: away.score,
        type: "Regular Season",
        rax
      };
    });

    const totalRax = schedule.reduce((sum, g) => sum + g.rax, 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}