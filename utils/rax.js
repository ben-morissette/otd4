import axios from "axios";

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

// Fetch list of teams for a sport
export const getTeams = async (sport) => {
  let url = "";
  switch (sport) {
    case "NHL":
      url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
      break;
    case "NFL":
      url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
      break;
    case "NBA":
      url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
      break;
    default:
      throw new Error("Unsupported sport");
  }

  const res = await axios.get(url);
  const teamsData =
    res.data.sports?.[0]?.leagues?.[0]?.teams || [];
  return teamsData.map((t) => ({
    abbr: t.team.abbreviation,
    displayName: t.team.displayName
  }));
};

// Fetch schedule and calculate RAX
export const getSchedule = async (sport, teamAbbr, season, rarity) => {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
  const url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/teams/${teamAbbr}/schedule?season=${season}&seasontype=2`;
  const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/teams/${teamAbbr}/schedule?season=${season}&seasontype=3`;

  const res = await axios.get(url);
  const playoffRes = await axios.get(playoffUrl);

  const teamName = res.data.team.displayName;
  const events = [...(res.data.events || []), ...(playoffRes.data.events || [])];

  const schedule = [];
  let gameNum = 1;

  events.forEach((event) => {
    let homeScore = event.competitions?.[0]?.competitors?.find(c => c.homeAway === "home")?.score || 0;
    let awayScore = event.competitions?.[0]?.competitors?.find(c => c.homeAway === "away")?.score || 0;

    let winner = homeScore > awayScore ? event.competitions[0].competitors[0].team.displayName : event.competitions[0].competitors[1].team.displayName;
    let WL = winner === teamName ? "W" : "L";
    let margin = Math.abs(homeScore - awayScore);
    let baseRax = winner === teamName ? margin * 10 : 0; // simplified
    let raxEarned = baseRax * rarityMultiplier;

    schedule.push({
      game: `Game ${gameNum}`,
      WL,
      date: event.date,
      name: event.name,
      Score: `${awayScore} - ${homeScore}`,
      rax_earned: raxEarned
    });

    gameNum += 1;
  });

  const totalRax = schedule.reduce((acc, g) => acc + g.rax_earned, 0);

  return { schedule, totalRax };
};
