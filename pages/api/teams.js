import fetch from 'node-fetch';

const SPORT_LEAGUES = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default async function handler(req, res) {
  const { sport } = req.query;

  if (!SPORT_LEAGUES[sport]) {
    return res.status(400).json({ error: "Invalid sport" });
  }

  const url = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_LEAGUES[sport]}/teams`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const teams = {};
    const teamData = data.sports?.[0]?.leagues?.[0]?.teams || [];
    teamData.forEach(team => {
      teams[team.team.abbreviation] = team.team.displayName;
    });

    res.status(200).json({ teams });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}