import axios from "axios";

const SPORT_MAP = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
  MLB: "baseball/mlb",
  CFB: "football/college-football",
  CBB: "basketball/college-basketball",
  WNBA: "basketball/wnba"
};

export default async function handler(req, res) {
  try {
    const { sport } = req.query;
    const leaguePath = SPORT_MAP[sport.toUpperCase()];
    if (!leaguePath) return res.status(400).json({ error: "Invalid sport" });

    const url = `http://site.api.espn.com/apis/site/v2/sports/${leaguePath}/teams`;
    const response = await axios.get(url);
    const teamsRaw = response.data?.sports?.[0]?.leagues?.[0]?.teams || [];

    const teams = {};
    teamsRaw.forEach((item) => {
      if (item?.team?.abbreviation && item?.team?.displayName) {
        teams[item.team.abbreviation] = item.team.displayName;
      }
    });

    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
