import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport } = req.query;
  if (!sport) return res.status(400).json({ error: "Sport required" });

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
    const url = `http://site.api.espn.com/apis/site/v2/sports/${leaguePath}/teams`;
    const response = await fetch(url);
    const data = await response.json();

    const teams = [];
    data.sports[0].leagues[0].teams.forEach(t => {
      teams.push({
        id: t.team.id,
        name: t.team.displayName
      });
    });

    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}