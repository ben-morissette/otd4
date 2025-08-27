export default async function handler(req, res) {
  const { sport, team, season } = req.query;

  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  let url = "";
  if (sport === "NHL") {
    url = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`;
  } else if (sport === "NFL") {
    url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=2`;
  } else if (sport === "NBA") {
    url = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;
  } else {
    return res.status(400).json({ error: "Invalid sport" });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
