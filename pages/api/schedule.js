import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport, teamId, season } = req.query;

  if (!sport || !teamId || !season)
    return res.status(400).json({ error: "Missing query params" });

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
    const url = `http://site.api.espn.com/apis/site/v2/sports/${leaguePath}/teams/${teamId}/schedule?season=${season}`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data.events || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}