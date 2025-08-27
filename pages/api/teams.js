import fetch from "node-fetch";

const SPORT_APIS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default async function handler(req, res) {
  const { sport } = req.query;

  if (!sport || !SPORT_APIS[sport]) {
    return res.status(400).json({ error: "Invalid or missing sport parameter" });
  }

  const url = `http://site.api.espn.com/apis/site/v2/sports/${SPORT_APIS[sport]}/teams`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const teams = {};
    const teamsData = data?.sports?.[0]?.leagues?.[0]?.teams || [];

    teamsData.forEach(t => {
      const abbr = t.team.abbreviation;
      const name = t.team.displayName;
      teams[abbr] = name;
    });

    if (Object.keys(teams).length === 0) {
      return res.status(404).json({ error: "No teams found" });
    }

    res.status(200).json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
