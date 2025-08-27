import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport } = req.query;
  if (!sport) return res.status(400).json({ error: "Missing sport" });

  const urls = {
    NHL: "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams",
    NFL: "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams",
    NBA: "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams",
  };

  try {
    const response = await fetch(urls[sport]);
    const data = await response.json();
    const teams = {};

    data.sports[0].leagues[0].teams.forEach((t) => {
      teams[t.team.abbreviation] = t.team.displayName;
    });

    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
