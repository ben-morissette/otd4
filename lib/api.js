import axios from "axios";

export const RARITY_MULTIPLIERS = {
  "General": 1,
  "Common": 1.2,
  "Uncommon": 1.4,
  "Rare": 1.6,
  "Epic": 2,
  "Leg": 2.5,
  "Mystic": 4,
  "Iconic": 6
};

export async function getTeams(sport) {
  const url = `http://site.api.espn.com/apis/site/v2/sports/${sport}/teams`;
  const res = await axios.get(url);
  const teams = {};
  res.data.sports[0].leagues[0].teams.forEach(team => {
    teams[team.team.abbreviation] = team.team.displayName;
  });
  return teams;
}

export async function getSchedule(sport, teamAbbr, season) {
  const url = `http://site.api.espn.com/apis/site/v2/sports/${sport}/teams/${teamAbbr}/schedule?season=${season}`;
  const res = await axios.get(url);
  return res.data.events || [];
}

export function calculateRaxForSchedule(sport, teamName, schedule, rarity) {
  const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
  let totalRax = 0;

  const rows = schedule.map(event => {
    if (!event.competitions || !event.competitions[0]) return null;

    const comp = event.competitions[0];
    let homeScore = parseInt(comp.competitors.find(c => c.homeAway === "home")?.score || 0);
    let awayScore = parseInt(comp.competitors.find(c => c.homeAway === "away")?.score || 0);

    const homeTeam = comp.competitors.find(c => c.homeAway === "home").team.displayName;
    const awayTeam = comp.competitors.find(c => c.homeAway === "away").team.displayName;

    const isHome = teamName === homeTeam;
    const isAway = teamName === awayTeam;
    const teamScore = isHome ? homeScore : awayScore;
    const opponentScore = isHome ? awayScore : homeScore;
    const margin = teamScore - opponentScore;

    let baseRax = 0;
    const isPlayoff = event.season?.type === 3;

    switch (sport) {
      case "baseball/mlb":
        if (!isPlayoff) baseRax = teamScore + (margin > 0 ? 5 * margin : 0);
        else if (margin > 0) baseRax = 20 + 8 * margin;
        break;
      case "hockey/nhl":
        if (margin > 0) baseRax = !isPlayoff ? 12 * margin : 20 + 20 * margin;
        break;
      case "football/college-football":
        if (margin > 0) baseRax = 100 + margin;
        else if (margin < 0) baseRax = Math.min(50, teamScore);
        break;
      case "football/nfl":
        if (margin > 0) baseRax = 100 + 2 * margin;
        else if (margin < 0) baseRax = teamScore + 5;
        break;
      case "basketball/nba":
        if (margin > 0) baseRax = !isPlayoff ? 2.5 * margin : 30 + margin;
        break;
      case "basketball/college-basketball":
        if (margin > 0) baseRax = !isPlayoff ? 50 + margin : 60 + margin;
        break;
      case "basketball/wnba":
        if (margin > 0) baseRax = !isPlayoff ? (opponentScore > 0 ? 50 : 40) + Math.min(10, margin) : 80 + margin;
        break;
      default:
        baseRax = 0;
    }

    baseRax *= multiplier;
    totalRax += baseRax;

    return {
      date: event.date,
      matchup: event.name,
      homeScore,
      awayScore,
      winner: margin > 0 ? teamName : opponentScore > teamScore ? (isHome ? awayTeam : homeTeam) : "Tie",
      loser: margin < 0 ? teamName : margin > 0 ? (isHome ? awayTeam : homeTeam) : "Tie",
      margin,
      rax: baseRax.toFixed(2)
    };
  }).filter(Boolean);

  return { rows, totalRax: totalRax.toFixed(2) };
}
