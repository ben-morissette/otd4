import fetch from "node-fetch";

const RARITY_MULTIPLIERS = {
  General: 1, Common: 1.2, Uncommon: 1.4, Rare: 1.6,
  Epic: 2, Leg: 2.5, Mystic: 4, Iconic: 6
};

const SPORT_APIS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default async function handler(req, res) {
  const { sport, team, season, rarity } = req.query;
  if (!sport || !team || !season) return res.status(400).json({ error: "Missing parameters" });

  try {
    const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
    const url = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_APIS[sport]}/teams/${team}/schedule?season=${season}&seasontype=2`;
    const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_APIS[sport]}/teams/${team}/schedule?season=${season}&seasontype=3`;

    const response = await fetch(url);
    const scheduleData = await response.json();

    const playoffResponse = await fetch(playoffUrl);
    const playoffData = await playoffResponse.json();

    const teamName = scheduleData.team?.displayName || "";

    const events = [...(scheduleData.events || []), ...(playoffData.events || [])];
    const schedule = events.map(e => {
      const comp = e.competitions?.[0]?.competitors || [];
      const home = comp.find(c => c.homeAway === "home");
      const away = comp.find(c => c.homeAway === "away");

      const homeScore = home?.score?.value || 0;
      const awayScore = away?.score?.value || 0;

      const winner = homeScore > awayScore ? home.team.displayName : awayScore > homeScore ? away.team.displayName : "Tie";
      const loser = winner === home.team.displayName ? away.team.displayName : winner === away.team.displayName ? home.team.displayName : "Tie";
      const margin = Math.abs(homeScore - awayScore);

      const baseRax = winner === teamName ? 12 * margin : 0;
      const raxEarned = baseRax * multiplier;

      return {
        date: e.date,
        name: e.name,
        Score: `${awayScore} - ${homeScore}`,
        type: e.seasonType === 3 ? "Playoffs" : "Regular Season",
        "W/L": winner === teamName ? "W" : loser === teamName ? "L" : "",
        rax_earned: raxEarned
      };
    });

    const totalRax = schedule.reduce((sum, g) => sum + (g.rax_earned || 0), 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
"Works"