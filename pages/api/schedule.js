import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { sport, team, season } = req.query;

  if (!sport || !team || !season) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  let url = `http://site.api.espn.com/apis/site/v2/sports/${sport.toLowerCase()}/${sport === 'NBA' ? 'nba' : sport.toLowerCase()}/teams/${team}/schedule?season=${season}&seasontype=2`;

  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
}