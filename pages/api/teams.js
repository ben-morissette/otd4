export default async function handler(req, res) {
  const { sport } = req.query;

  let url = "";
  if (sport === "NHL") {
    url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
  } else if (sport === "NFL") {
    url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
  } else if (sport === "NBA") {
    url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
  } else {
    return res.status(400).json({ error: "Invalid sport" });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const teams = {};
    for (const team of data.sports[0].leagues[0].teams) {
      const abbr = team.team.abbreviation;
      const name = team.team.displayName;
      teams[abbr] = name;
    }
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
