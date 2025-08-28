import fetch from "node-fetch";

const SPORT_ENDPOINTS = {
  NFL: "football/nfl",
  NBA: "basketball/nba",
  NHL: "hockey/nhl",
  MLB: "baseball/mlb",
  WNBA: "basketball/wnba",
  CBB: "basketball/college-basketball",
  CFB: "football/college-football"
};

export default async function handler(req, res) {
  const { sport } = req.query;

  if (!sport || !SPORT_ENDPOINTS[sport]) {
    return res.status(400).json({ error: "Invalid sport" });
  }

  try {
    const url = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_ENDPOINTS[sport]}/teams`;
    const response = await fetch(url);
    const data = await response.json();

    const teams = data.sports[0].leagues[0].teams.map(team => ({
      id: team.team.id,
      abbreviation: team.team.abbreviation,
      name: team.team.displayName
    }));

    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}