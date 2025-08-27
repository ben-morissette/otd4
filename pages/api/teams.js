export default async function handler(req, res) {
  const { sport } = req.query;

  let url = "";
  if (sport === "NHL") url = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
  if (sport === "NFL") url = "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
  if (sport === "NBA") url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

  const response = await fetch(url);
  const data = await response.json();
  const teams = {};
  for (const team of data.sports[0].leagues[0].teams) {
    teams[team.team.abbreviation] = team.team.displayName;
  }

  res.status(200).json(teams);
}
