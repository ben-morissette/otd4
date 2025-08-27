import axios from "axios";

export default async function handler(req, res) {
  try {
    const { sport } = req.query;
    if (!sport) return res.status(400).json({ error: "Sport is required" });

    // Map sport input to API paths
    const sportPaths = {
      NHL: "hockey/nhl",
      NFL: "football/nfl",
      NBA: "basketball/nba"
    };

    const path = sportPaths[sport.toUpperCase()];
    if (!path) return res.status(400).json({ error: "Sport not supported" });

    const url = `http://site.api.espn.com/apis/site/v2/sports/${path}/teams`;
    const response = await axios.get(url);

    const teamsData = response.data.sports[0].leagues[0].teams;
    const teams = {};
    teamsData.forEach((teamObj) => {
      teams[teamObj.team.abbreviation] = teamObj.team.displayName;
    });

    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
