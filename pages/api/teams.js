import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { sport } = req.query;
  if (!sport) {
    return res.status(400).json({ error: 'Missing sport' });
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/teams`;
    const response = await fetch(url);
    const data = await response.json();

    const teams = data.sports[0].leagues[0].teams.map((t) => ({
      id: t.team.id,
      displayName: t.team.displayName
    }));

    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}