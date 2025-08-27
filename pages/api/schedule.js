export const RARITY_MULTIPLIERS = {
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
  try {
    const { sport, teamAbbr, season, rarity } = req.query;
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

    const baseUrl = (type) => {
      if (sport === "NHL") return `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${teamAbbr}/schedule?season=${season}&seasontype=${type}`;
      if (sport === "NFL") return `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamAbbr}/schedule?season=${season}&seasontype=${type}`;
      if (sport === "NBA") return `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamAbbr}/schedule?season=${season}&seasontype=${type}`;
    };

    const [regRes, playoffRes] = await Promise.all([
      fetch(baseUrl(2)),
      fetch(baseUrl(3))
    ]);

    const [regData, playoffData] = await Promise.all([regRes.json(), playoffRes.json()]);

    if (!regData.team || !regData.team.displayName) {
      return res.status(404).json({ schedule: [], totalRax: 0 });
    }

    const teamName = regData.team.displayName;
    const scheduleList = [];

    // Helper to process events
    const processEvent = (event, type) => {
      let homeScore = 0, awayScore = 0;
      let homeDisplay = "0", awayDisplay = "0";

      for (const competition of event.competitions || []) {
        for (const competitor of competition.competitors || []) {
          if (competitor.homeAway === "home") {
            homeScore = parseInt(competitor.score || 0);
            homeDisplay = competitor.score?.toString() || "0";
          } else {
            awayScore = parseInt(competitor.score || 0);
            awayDisplay = competitor.score?.toString() || "0";
          }
        }
      }

      let winner = "", loser = "";
      if (homeScore > awayScore) {
        winner = event.name.split(" at ")[1] || "";
        loser = event.name.split(" at ")[0] || "";
      } else if (awayScore > homeScore) {
        winner = event.name.split(" at ")[0] || "";
        loser = event.name.split(" at ")[1] || "";
      } else {
        winner = "Tie";
        loser = "Tie";
      }

      const margin = Math.abs(homeScore - awayScore);

      // Base RAX calculation
      let baseRax = 0;
      if (winner === teamName) {
        if (type === "Playoffs") {
          if (sport === "NHL") baseRax = 20 + 20 * margin;
          if (sport === "NFL") baseRax = 100 + 2 * margin;
          if (sport === "NBA") baseRax = 30 + 2.5 * margin;
        } else {
          if (sport === "NHL") baseRax = 12 * margin;
          if (sport === "NFL") baseRax = 100 + 2 * margin;
          if (sport === "NBA") baseRax = 2.5 * margin;
        }
      } else {
        if (sport === "NFL" && type !== "Playoffs") {
          baseRax = (teamName === event.name.split(" at ")[0] ? awayScore : homeScore) + 5;
        }
      }

      const rax = baseRax * rarityMultiplier;

      let W_L = "";
      if (winner === teamName) W_L = "W";
      else if (loser === teamName) W_L = "L";

      return {
        date: event.date || "",
        name: event.name || "",
        type,
        Score: type === "Playoffs" ? "" : `${awayDisplay} - ${homeDisplay}`,
        winner,
        loser,
        margin,
        baseRax,
        rax,
        W_L
      };
    };

    // Regular season events
    for (const event of regData.events || []) {
      scheduleList.push(processEvent(event, "Regular Season"));
    }

    // Playoffs separator row
    if (playoffData.events && playoffData.events.length > 0) {
      scheduleList.push({
        date: "",
        name: "Playoffs",
        type: "",
        Score: "",
        winner: "",
        loser: "",
        margin: "",
        baseRax: "",
        rax: "",
        W_L: ""
      });

      for (const event of playoffData.events || []) {
        scheduleList.push(processEvent(event, "Playoffs"));
      }
    }

    const totalRax = scheduleList.reduce((acc, g) => acc + (g.rax || 0), 0);

    res.status(200).json({ schedule: scheduleList, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ schedule: [], totalRax: 0, error: err.message });
  }
}
