import fetch from 'node-fetch';

const SPORTS_API = {
  NHL: 'hockey/nhl',
  NFL: 'football/nfl',
  NBA: 'basketball/nba',
};

export async function getTeams(sport) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${SPORTS_API[sport]}/teams`;
  const res = await fetch(url);
  const data = await res.json();
  const teams = {};
  data.sports[0].leagues[0].teams.forEach((t) => {
    teams[t.team.abbreviation] = t.team.displayName;
  });
  return teams;
}

// Simplified schedule fetch for demonstration
export async function getSchedule(sport, teamAbbr, year) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${SPORTS_API[sport]}/teams/${teamAbbr}/schedule?season=${year}&seasontype=2`;
  const res = await fetch(url);
  const data = await res.json();
  const events = data.events || [];
  return events.map((event) => {
    const home = event.competitions[0].competitors.find(c => c.homeAway === 'home');
    const away = event.competitions[0].competitors.find(c => c.homeAway === 'away');
    return {
      date: event.date,
      name: event.name,
      homeTeam: home.team.displayName,
      awayTeam: away.team.displayName,
      homeScore: parseInt(home.score || 0),
      awayScore: parseInt(away.score || 0),
    };
  });
}

// Rax calculation per sport rules
export function calculateRax(sport, teamName, game) {
  let rax = 0;
  const homeWin = game.homeScore > game.awayScore;
  const awayWin = game.awayScore > game.homeScore;
  const margin = Math.abs(game.homeScore - game.awayScore);

  switch (sport) {
    case 'NHL':
      if ((homeWin && teamName === game.homeTeam) || (awayWin && teamName === game.awayTeam)) {
        rax = 12 * margin;
      }
      break;
    case 'NFL':
      const closeGameBonus = 5;
      const teamScore = teamName === game.homeTeam ? game.homeScore : game.awayScore;
      if ((homeWin && teamName === game.homeTeam) || (awayWin && teamName === game.awayTeam)) {
        rax = 100 + (margin * 2);
      } else {
        rax = teamScore + closeGameBonus;
      }
      break;
    case 'NBA':
      if ((homeWin && teamName === game.homeTeam) || (awayWin && teamName === game.awayTeam)) {
        rax = 2.5 * margin;
      }
      break;
    default:
      rax = 0;
  }
  return rax;
}
