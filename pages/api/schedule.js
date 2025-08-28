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

function parseScore(scoreObj) {
  // Some scores are objects with .value, sometimes just a number
  if (!scoreObj) return 0;
  if (typeof scoreObj === "number") return scoreObj;
  if ("value" in scoreObj) return scoreObj.value;
  return 0;
}

function calculateMargin(homeScore, awayScore) {
  return Math.abs(homeScore - awayScore);
}

// Example Rax calculation for NHL
function calcNHLRax(homeScore, awayScore, winner, type, rarityMultiplier) {
  const margin = calculateMargin(homeScore, awayScore);
  if (winner === "home" || winner === "away") {
    if (type === "Playoffs") return (20 + 20 * margin) * rarityMultiplier;
    else return 12 * margin * rarityMultiplier;
  }
  return 0;
}

// Example Rax calculation for NFL
function calcNFLRax(homeScore, awayScore, winner, type, rarityMultiplier) {
  const margin = calculateMargin(homeScore, awayScore);
  const closeGameBonus = 5;
  if (winner === "home" || winner === "away") return (100 + 2 * margin) * rarityMultiplier;
  return (homeScore + closeGameBonus) * rarityMultiplier;
}

// Example Rax calculation for NBA
function calcNBARax(homeScore, awayScore, winner, type, rarityMultiplier) {
  const margin = calculateMargin(homeScore, awayScore);
  if (winner === "home" || winner === "away") {
    if (type === "Playoffs") return (30 + margin) * rarityMultiplier;
    return 2.5 * margin * rarityMultiplier;
  }
  return 0;
}

async function fetchSchedule(sport, league, teamAbbr, season, rarity = "General") {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  const regularURL = `http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamAbbr}/schedule?season=${season}&seasontype=2`;
  const playoffURL = `http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamAbbr}/schedule?season=${season}&seasontype=3`;

  const [regRes, poRes] = await Promise.all([fetch(regularURL), fetch(playoffURL)]);
  const regData = await regRes.json();
  const poData = await poRes.json();

  const events = [...(regData.events || []), ...(poData.events || [])];

  const schedule = events.map((ev) => {
    const competitors = ev.competitions[0].competitors;
    const home = competitors.find((c) => c.homeAway === "home");
    const away = competitors.find((c) => c.homeAway === "away");

    const homeScore = parseScore(home.score);
    const awayScore = parseScore(away.score);

    let winner = "Tie";
    if (homeScore > awayScore) winner = "home";
    else if (awayScore > homeScore) winner = "away";

    let rax = 0;
    if (sport === "hockey" && league === "nhl") rax = calcNHLRax(homeScore, awayScore, winner, ev.seasonType === 3 ? "Playoffs" : "Regular Season", rarityMultiplier);
    if (sport === "football" && league === "nfl") rax = calcNFLRax(homeScore, awayScore, winner, ev.seasonType === 3 ? "Playoffs" : "Regular Season", rarityMultiplier);
    if (sport === "basketball" && league === "nba") rax = calcNBARax(homeScore, awayScore, winner, ev.seasonType === 3 ? "Playoffs" : "Regular Season", rarityMultiplier);

    return {
      date: ev.date,
      matchup: `${away.team.abbreviation} at ${home.team.abbreviation}`,
      score: `${awayScore} - ${homeScore}`,
      type: ev.seasonType === 3 ? "Playoffs" : "Regular Season",
      winner,
      rax_earned: rax,
    };
  });

  return schedule;
}

export default async function handler(req, res) {
  try {
    const { sport, league, team, season, rarity } = req.query;
    if (!sport || !league || !team || !season) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }

    const schedule = await fetchSchedule(sport, league, team, season, rarity);
    res.status(200).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}