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
  const { team, season, rarity = "General" } = req.query;

  if (!team || !season) {
    return res.status(400).json({ error: "team and season required" });
  }

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
  const regularUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;
  const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=3`;

  const regRes = await fetch(regularUrl);
  const regularData = await regRes.json();

  const playRes = await fetch(playoffUrl);
  const playoffData = await playRes.json();

  const teamName = regularData.team?.displayName || team;
  let schedule = [];

  // Helper function for Rax
  const calcRax = (homeScore, awayScore, winner, type) => {
    const diff = Math.abs(homeScore - awayScore);
    if (winner === teamName) {
      return type === "Playoffs" ? 30 + diff : 2.5 * diff;
    }
    return 0;
  };

  const parseEvents = (events, type) => {
    events?.forEach((event) => {
      const comp = event.competitions?.[0];
      if (!comp) return;
      let homeScore = 0;
      let awayScore = 0;
      comp.competitors.forEach((c) => {
        if (c.homeAway === "home") homeScore = parseInt(c.score) || 0;
        else awayScore = parseInt(c.score) || 0;
      });

      let winner = homeScore > awayScore ? comp.competitors.find(c => c.homeAway === "home").team.displayName
                  : awayScore > homeScore ? comp.competitors.find(c => c.homeAway === "away").team.displayName
                  : "Tie";

      schedule.push({
        date: event.date,
        matchup: event.name,
        score: `${awayScore} - ${homeScore}`,
        W_L: winner === teamName ? "W" : winner === "Tie" ? "Tie" : "L",
        raxEarned: calcRax(homeScore, awayScore, winner, type) * rarityMultiplier
      });
    });
  };

  parseEvents(regularData.events, "Regular Season");
  parseEvents(playoffData.events, "Playoffs");

  const totalRax = schedule.reduce((acc, g) => acc + g.raxEarned, 0);

  res.status(200).json({ schedule, totalRax });
}