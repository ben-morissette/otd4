export async function fetchSports() {
  return [
    { id: "nba", name: "NBA" },
    { id: "nfl", name: "NFL" },
    { id: "nhl", name: "NHL" }
  ];
}

export async function fetchSeasons(sport) {
  return ["2022", "2023", "2024"];
}

export async function fetchTeams(sport, season) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${sport}/teams`);
  const data = await res.json();
  return data.sports[0].leagues[0].teams.map((t) => t.team);
}

export async function fetchSchedule(sport, season, teamId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${sport}/teams/${teamId}/schedule?season=${season}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.events.map((e) => ({
    id: e.id,
    date: e.date,
    matchup: `${e.competitions[0].competitors[1].team.displayName} @ ${e.competitions[0].competitors[0].team.displayName}`,
    score: `${e.competitions[0].competitors[0].score} - ${e.competitions[0].competitors[1].score}`,
    status: e.status.type.description,
    rax: 0.0
  }));
}