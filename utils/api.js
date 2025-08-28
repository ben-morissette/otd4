const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

export async function fetchSports() {
  return [
    { id: 'basketball/nba', name: 'NBA' },
    { id: 'football/nfl', name: 'NFL' },
    { id: 'hockey/nhl', name: 'NHL' }
  ];
}

export async function fetchTeams(sport) {
  const res = await fetch(`${BASE_URL}/${sport}/teams`);
  const data = await res.json();
  return data.sports[0].leagues[0].teams.map(t => t.team);
}

export async function fetchSchedule(sport, season, teamId) {
  const res = await fetch(`${BASE_URL}/${sport}/teams/${teamId}/schedule?season=${season}`);
  const data = await res.json();
  return data.events || [];
}