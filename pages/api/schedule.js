import fetch from "node-fetch";

const RARITY_MULTIPLIERS = {
  General: 1, Common: 1.2, Uncommon: 1.4,
  Rare: 1.6, Epic: 2, Leg: 2.5, Mystic: 4, Iconic: 6
};

export default async function handler(req, res) {
  const { sport, teamAbbr, season, rarity } = req.query;
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  let regUrl, playoffUrl;
  if (sport === "NHL" || sport === "NFL" || sport === "NBA") {
    const baseUrl = sport === "NHL" ? "hockey/nhl" : sport === "NFL" ? "football/nfl" : "basketball/nba";
    regUrl = `http://site.api.espn.com/apis/site/v2/sports/${baseUrl}/teams/${teamAbbr}/schedule?season=${season}&seasontype=2`;
    playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/${baseUrl}/teams/${teamAbbr}/schedule?season=${season}&seasontype=3`;
  } else return res.status(400).json({ error: "Invalid sport" });

  try {
    const [regRes, playoffRes] = await Promise.all([fetch(regUrl), fetch(playoffUrl)]);
    const regData = await regRes.json();
    const playoffData = await playoffRes.json();

    const teamName = regData?.team?.displayName || "";

    const processEvents = (events, type) => events.map(event => {
      let homeScore = 0, awayScore = 0, homeDisplay = "0", awayDisplay = "0";
      event.competitions?.[0]?.competitors?.forEach(c => {
        if (c.homeAway === "home") {
          homeScore = c.score?.value || 0;
          homeDisplay = c.score?.displayValue || "0";
        } else {
          awayScore = c.score?.value || 0;
          awayDisplay = c.score?.displayValue || "0";
        }
      });

      const winner = homeScore > awayScore ? event.name.split(" at ")[1] :
                     awayScore > homeScore ? event.name.split(" at ")[0] : "Tie";
      const loser = homeScore > awayScore ? event.name.split(" at ")[0] :
                    awayScore > homeScore ? event.name.split(" at ")[1] : "Tie";
      const margin = Math.abs(homeScore - awayScore);

      let baseRax = 0;
      if (sport === "NHL") baseRax = winner === teamName ? (type==="Playoffs" ? 20 + 20*margin : 12*margin) : 0;
      else if (sport === "NFL") baseRax = winner === teamName ? 100 + 2*margin : homeScore + 5;
      else if (sport === "NBA") baseRax = winner === teamName ? (type==="Playoffs" ? 30 + 2.5*margin : 2.5*margin) : 0;

      return {
        date: event.date || "",
        name: event.name || "",
        type,
        Score: type === "Playoffs" ? "" : `${awayDisplay} - ${homeDisplay}`,
        winner,
        loser,
        margin,
        baseRax,
        rax: baseRax * rarityMultiplier,
        W_L: winner === teamName ? "W" : loser === teamName ? "L" : ""
      };
    });

    let schedule = [...processEvents(regData.events || [], "Regular Season")];
    if ((playoffData.events || []).length > 0) {
      schedule.push({ date: "", name: "Playoffs", type: "", Score: "", winner: "", loser: "", margin: "", baseRax: "", rax: 0, W_L: "" });
      schedule = schedule.concat(processEvents(playoffData.events, "Playoffs"));
    }

    const totalRax = schedule.reduce((acc, e) => acc + (e.rax || 0), 0);

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
