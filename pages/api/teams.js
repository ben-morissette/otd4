import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport } = req.query;
  if (!sport) return res.status(400).json({ error: "Missing sport" });

  try {
    const url = `http://site.api.espn.com/apis/site/v2/sports/${sport}/teams`;
    const response = await fetch(url);
    const data = await response.json();

    const teams = data.sports[0].leagues[0].teams.map((t) => ({
      id: t.team.id,
      name: t.team.displayName,
    }));

    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}