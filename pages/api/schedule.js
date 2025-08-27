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

  // Set URLs for schedule
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

    // Safe score extraction
    const getScores = (event) => {
      let home = "", away = "";
      for (const competition of event.competitions || []) {
        for (const competitor of competition.competitors || []) {
          const score = competitor.score?.value ?? "";
          if (competitor.homeAway === "home") home = score;
          else away = score;
        }
      }
      return { home, away };
    };

    // Add regular season
    for (const event of scheduleData.events || []) {
      const { home, away } = getScores(event);
      const margin = home !== "" && away !== "" ? Math.abs(home - away) : 0;
      const winner =
        home !== "" && away !== ""
          ? home > away
            ? event.name.split(" at ")[1]
            : away > home
            ? event.name.split(" at ")[0]
            : "Tie"
          : "";
      scheduleList.push({
        date: event.date,
        name: event.name,
        type: "Regular Season",
        Score: home !== "" && away !== "" ? `${away} - ${home}` : "",
        WL:
          winner === teamName
            ? "W"
            : winner && winner !== "Tie"
            ? "L"
            : "",
        rax_earned:
          winner === teamName
            ? 12 * margin * rarityMultiplier
            : 0,
      });
    }

    // Add playoff placeholder + playoff games
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
        const margin = home !== "" && away !== "" ? Math.abs(home - away) : 0;
        const winner =
          home !== "" && away !== ""
            ? home > away
              ? event.name.split(" at ")[1]
              : away > home
              ? event.name.split(" at ")[0]
              : "Tie"
            : "";
        scheduleList.push({
          date: event.date,
          name: event.name,
          type: "Playoffs",
          Score: home !== "" && away !== "" ? `${away} - ${home}` : "",
          WL:
            winner === teamName
              ? "W"
              : winner && winner !== "Tie"
              ? "L"
              : "",
          rax_earned:
            winner === teamName
              ? (20 + 20 * margin) * rarityMultiplier
              : 0,
        });
      }
    }

    // Total RAX
    const totalRax = scheduleList.reduce(
      (sum, g) => sum + (g.rax_earned || 0),
      0
    );

    res.status(200).json({ schedule: scheduleList, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
