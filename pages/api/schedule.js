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

const SPORT_APIS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default async function handler(req, res) {
  const { sport, team, season, rarity } = req.query;
  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing required params" });
  }

  const apiUrl = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_APIS[sport]}/teams/${team}/schedule?season=${season}&seasontype=2`;
  const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_APIS[sport]}/teams/${team}/schedule?season=${season}&seasontype=3`;

  try {
    const [regularResp, playoffResp] = await Promise.all([
      fetch(apiUrl),
      fetch(playoffUrl),
    ]);

    const scheduleData = await regularResp.json();
    const playoffData = await playoffResp.json();

    if (!scheduleData.team) {
      return res.status(404).json({ error: "Team schedule not found" });
    }

    const teamName = scheduleData.team.displayName;
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

    const events = [...(scheduleData.events || []), ...(playoffData.events || [])];

    const schedule = events.map(event => {
      const competitors = event.competitions?.[0]?.competitors || [];
      const home = competitors.find(c => c.homeAway === "home");
      const away = competitors.find(c => c.homeAway === "away");

      const homeScore = home?.score?.value ?? 0;
      const awayScore = away?.score?.value ?? 0;

      let winner = "";
      let loser = "";
      if (homeScore > awayScore) {
        winner = home.team.displayName;
        loser = away.team.displayName;
      } else if (awayScore > homeScore) {
        winner = away.team.displayName;
        loser = home.team.displayName;
      } else {
        winner = loser = "Tie";
      }

      const margin = Math.abs(homeScore - awayScore);

      let baseRax = 0;
      if (winner === teamName) {
        baseRax = event.seasonType === 3 ? 20 + 20 * margin : 12 * margin;
      }

      const raxEarned = baseRax * rarityMultiplier;

      return {
        date: event.date,
        name: event.name,
        Score: `${awayScore} - ${homeScore}`,
        type: event.seasonType === 3 ? "Playoffs" : "Regular Season",
        "W/L": winner === teamName ? "W" : loser === teamName ? "L" : "",
        rax_earned: raxEarned,
      };
    });

    const totalRax = schedule.reduce((acc, g) => acc + g.rax_earned, 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
