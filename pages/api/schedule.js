import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport, season, team } = req.query;
  if (!sport || !season || !team) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const url = `http://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard?season=${season}`;
    const response = await fetch(url);
    const data = await response.json();

    const games = [];
    data.events.forEach((e) => {
      const home = e.competitions[0].competitors.find((c) => c.homeAway === "home");
      const away = e.competitions[0].competitors.find((c) => c.homeAway === "away");

      const isTeam = home.team.id === parseInt(team) || away.team.id === parseInt(team);
      if (!isTeam) return;

      const winner = e.competitions[0].competitors.find((c) => c.winner)?.team?.id;

      games.push({
        id: e.id,
        date: e.date,
        homeId: home.team.id,
        awayId: away.team.id,
        homeScore: home.score,
        awayScore: away.score,
        teamId: parseInt(team),
        opponent: home.team.id === parseInt(team) ? away.team.displayName : home.team.displayName,
        winner,
        isPlayoff: e.competitions[0].playoffs ?? false,
      });
    });

    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}