import fetch from "node-fetch";

const SPORT_APIS = {
  NHL: "hockey/nhl",
  NFL: "football/nfl",
  NBA: "basketball/nba",
};

export default async function handler(req, res) {
  const { sport } = req.query;
  if (!sport || !SPORT_APIS[sport]) return res.status(400).json({ error: "Invalid sport" });

  try {
    const response = await fetch(`http://site.api.espn.com/apis/site/v2/sports/${SPORT_APIS[sport]}/teams`);
    const data = await response.json();
    const teams = {};
    (data.sports?.[0]?.leagues?.[0]?.teams || []).forEach(t => {
      teams[t.team.abbreviation] = t.team.displayName;
    });
    res.status(200).json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
