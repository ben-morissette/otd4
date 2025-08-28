import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { sport, season, teamId } = req.query;

  if (!sport || !season || !teamId) {
    return res.status(400).json({ error: 'Missing sport, season, or teamId' });
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/teams/${teamId}/schedule?season=${season}`;
    const response = await fetch(url);
    const data = await response.json();

    const schedule = (data.events || []).map((event) => {
      const home = event.competitions[0].competitors.find((c) => c.homeAway === 'home').team.displayName;
      const away = event.competitions[0].competitors.find((c) => c.homeAway === 'away').team.displayName;

      const scoreHome = event.competitions[0].competitors.find((c) => c.homeAway === 'home').score;
      const scoreAway = event.competitions[0].competitors.find((c) => c.homeAway === 'away').score;

      return {
        date: event.date,
        matchup: `${away} @ ${home}`,
        score: `${scoreAway} - ${scoreHome}`,
        result: event.status?.type?.description || 'Scheduled',
        rax: '0.00'
      };
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
}