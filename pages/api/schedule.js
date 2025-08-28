export default async function handler(req, res) {
  const { sport, teamId, season } = req.query;
  if (!sport || !teamId || !season) return res.status(400).json({ error: "Sport, teamId and season required" });

  let leaguePath;
  switch (sport.toUpperCase()) {
    case "NFL": leaguePath = "football/nfl"; break;
    case "NBA": leaguePath = "basketball/nba"; break;
    case "NHL": leaguePath = "hockey/nhl"; break;
    case "MLB": leaguePath = "baseball/mlb"; break;
    case "WNBA": leaguePath = "basketball/wnba"; break;
    case "CBB": leaguePath = "basketball/college-men"; break;
    case "CFB": leaguePath = "football/college-football"; break;
    default: return res.status(400).json({ error: "Unknown sport" });
  }

  try {
    // ESPN API doesn't use season span, just single year
    const url = `http://site.api.espn.com/apis/site/v2/sports/${leaguePath}/teams/${teamId}/schedule?season=${season}`;
    const response = await fetch(url);
    const data = await response.json();

    const schedule = data.events.map(event => {
      const homeTeam = {
        id: event.competitions[0].competitors[0].team.id,
        name: event.competitions[0].competitors[0].team.displayName,
        score: parseInt(event.competitions[0].competitors[0].score, 10) || 0
      };
      const awayTeam = {
        id: event.competitions[0].competitors[1].team.id,
        name: event.competitions[0].competitors[1].team.displayName,
        score: parseInt(event.competitions[0].competitors[1].score, 10) || 0
      };

      return {
        id: event.id,
        date: event.date,
        status: event.status.type.description,
        homeTeam,
        awayTeam,
        rax: calculateRax(sport, { homeTeam, awayTeam, competitions: event.competitions }, teamId)
      };
    });

    res.status(200).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}