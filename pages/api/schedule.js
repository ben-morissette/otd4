import fetch from 'node-fetch';

// Rax multipliers
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

const SPORT_LEAGUES = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default async function handler(req, res) {
  const { sport, team, season, rarity = "General" } = req.query;

  if (!SPORT_LEAGUES[sport] || !team || !season) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
  const url = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_LEAGUES[sport]}/teams/${team}/schedule?season=${season}&seasontype=2`;
  const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_LEAGUES[sport]}/teams/${team}/schedule?season=${season}&seasontype=3`;

  try {
    const [resp, playoffResp] = await Promise.all([fetch(url), fetch(playoffUrl)]);
    const data = await resp.json();
    const playoffData = await playoffResp.json();

    const schedule = [];
    const teamName = data.team?.displayName || "";

    function calcRax(home, away, type = "Regular") {
      const homeScore = parseInt(home?.score || 0);
      const awayScore = parseInt(away?.score || 0);
      let rax = 0;

      if (sport === "NHL") {
        if (homeScore !== awayScore) {
          const winner = homeScore > awayScore ? "home" : "away";
          if ((winner === "home" && home.team.abbreviation === team) || (winner === "away" && away.team.abbreviation === team)) {
            rax = type === "Playoffs" ? 20 + 20 * Math.abs(homeScore - awayScore) : 12 * Math.abs(homeScore - awayScore);
          }
        }
      } else if (sport === "NFL") {
        const teamScore = (home.team.abbreviation === team ? homeScore : awayScore);
        if (homeScore !== awayScore) {
          const winner = homeScore > awayScore ? home : away;
          rax = (winner.team.abbreviation === team ? 100 + 2 * Math.abs(homeScore - awayScore) : teamScore);
        } else {
          rax = teamScore;
        }
      } else if (sport === "NBA") {
        const margin = Math.abs(homeScore - awayScore);
        const winner = homeScore > awayScore ? home : away;
        rax = winner.team.abbreviation === team ? (type === "Playoffs" ? 30 + margin : 2.5 * margin) : 0;
      }
      return rax * rarityMultiplier;
    }

    data.events?.forEach(event => {
      const comp = event.competitions?.[0]?.competitors || [];
      const home = comp.find(c => c.homeAway === "home") || {};
      const away = comp.find(c => c.homeAway === "away") || {};
      schedule.push({
        date: event.date,
        name: event.name,
        type: "Regular",
        score: `${away.score || 0} - ${home.score || 0}`,
        rax: calcRax(home, away)
      });
    });

    playoffData.events?.forEach(event => {
      const comp = event.competitions?.[0]?.competitors || [];
      const home = comp.find(c => c.homeAway === "home") || {};
      const away = comp.find(c => c.homeAway === "away") || {};
      schedule.push({
        date: event.date,
        name: event.name,
        type: "Playoffs",
        score: `${away.score || 0} - ${home.score || 0}`,
        rax: calcRax(home, away, "Playoffs")
      });
    });

    const totalRax = schedule.reduce((sum, g) => sum + g.rax, 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}