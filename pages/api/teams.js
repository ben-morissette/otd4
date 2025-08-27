import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport } = req.query;
  if (!sport) return res.status(400).json({ error: "Missing sport parameter" });

  let url;
  if (sport === "NHL") url = "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
  else if (sport === "NFL") url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
  else if (sport === "NBA") url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
  else return res.status(400).json({ error: "Invalid sport" });

  try {
    const response = await fetch(url);
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
