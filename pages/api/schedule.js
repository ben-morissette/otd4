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

  if (!team || !season || !sport) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  let url, playoffUrl;
  if (sport === "NHL") {
    url = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`;
    playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=3`;
  } else if (sport === "NFL") {
    url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`;
    playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=3`;
  } else if (sport === "NBA") {
    url = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;
    playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=3`;
  } else {
    return res.status(400).json({ error: "Invalid sport" });
  }

  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  try {
    const scheduleResp = await fetch(url);
    const playoffResp = await fetch(playoffUrl);
    const scheduleData = await scheduleResp.json();
    const playoffData = await playoffResp.json();

    const teamName = scheduleData.team?.displayName || "";

    const scheduleList = [];

    const getScores = (event) => {
      let home = 0, away = 0;
      for (const competition of event.competitions) {
        for (const competitor of competition.competitors) {
          if (competitor.homeAway === "home") home = competitor.score;
          else away = competitor.score;
        }
      }
      return { home, away };
    };

    for (const event of scheduleData.events || []) {
      const { home, away } = getScores(event);
      scheduleList.push({
        date: event.date,
        name: event.name,
        type: "Regular Season",
        Score: `${away} - ${home}`,
        WL: home > away ? (teamName === event.name.split(" at ")[1] ? "W" : "L") : "L",
        rax_earned: (home > away ? 12 * Math.abs(home - away) : 0) * rarityMultiplier,
      });
    }

    if (playoffData.events && playoffData.events.length) {
      scheduleList.push({
        date: "",
        name: "Playoffs",
        type: "",
        Score: "",
        WL: "",
        rax_earned: 0,
      });
      for (const event of playoffData.events) {
        const { home, away } = getScores(event);
        scheduleList.push({
          date: event.date,
          name: event.name,
          type: "Playoffs",
          Score: `${away} - ${home}`,
          WL: home > away ? (teamName === event.name.split(" at ")[1] ? "W" : "L") : "L",
          rax_earned: (home > away ? 20 * Math.abs(home - away) + 20 : 0) * rarityMultiplier,
        });
      }
    }

    const totalRax = scheduleList.reduce((sum, g) => sum + (g.rax_earned || 0), 0);

    res.status(200).json({ schedule: scheduleList, totalRax });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
