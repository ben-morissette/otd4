import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sport, season, team } = req.query;

  if (!sport) return res.status(400).json({ error: "Sport is required" });

  try {
    let url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${sport}/teams`;
    const response = await fetch(url);
    const data = await response.json();

    if (!season && !team) {
      // Return teams
      const teams = data.sports[0].leagues[0].teams.map((t) => ({
        id: t.team.id,
        name: t.team.displayName
      }));
      return res.status(200).json({ teams });
    }

    if (team && season) {
      // Fetch schedule
      const scheduleUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${sport}/teams/${team}/schedule?season=${season}`;
      const scheduleRes = await fetch(scheduleUrl);
      const scheduleData = await scheduleRes.json();

      const schedule = scheduleData.events.map((event) => ({
        date: event.date,
        name: event.name,
        shortName: event.shortName,
        status: event.status?.type?.description || "Scheduled",
        score: event.competitions[0]?.competitors?.map((c) => ({
          team: c.team.displayName,
          score: c.score
        })),
        rax: calculateRAX(event)
      }));

      return res.status(200).json({ schedule });
    }

    return res.status(400).json({ error: "Missing season or team" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}

function calculateRAX(event) {
  // Example logic for RAX calculation
  const homeScore = parseInt(event.competitions[0]?.competitors[0]?.score || 0);
  const awayScore = parseInt(event.competitions[0]?.competitors[1]?.score || 0);
  return homeScore && awayScore ? (homeScore + awayScore) / 2 : 0;
}