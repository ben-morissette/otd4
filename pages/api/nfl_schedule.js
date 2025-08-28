import fetch from 'node-fetch';

const RARITY_MULTIPLIERS = {
  "General": 1,
  "Common": 1.2,
  "Uncommon": 1.4,
  "Rare": 1.6,
  "Epic": 2,
  "Leg": 2.5,
  "Mystic": 4,
  "Iconic": 6
};

const CLOSE_GAME_BONUS = 5;

export default async function handler(req, res) {
  try {
    const { team, season, rarity = "General" } = req.query;
    if (!team || !season) {
      return res.status(400).json({ error: "Missing team or season parameter" });
    }

    // 1️⃣ Get scoreboard events
    const scoreboardUrl = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?season=${season}`;
    const scoreboardResp = await fetch(scoreboardUrl);
    const scoreboardData = await scoreboardResp.json();
    const events = scoreboardData.events || [];

    // 2️⃣ Build schedule with scores and Rax
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
    const schedule = events.map((event) => {
      const competition = event.competitions[0];
      const home = competition.competitors.find(c => c.homeAway === 'home');
      const away = competition.competitors.find(c => c.homeAway === 'away');

      const homeScore = home.score ? parseInt(home.score) : null;
      const awayScore = away.score ? parseInt(away.score) : null;

      let winner = '';
      let loser = '';
      if (homeScore != null && awayScore != null) {
        if (homeScore > awayScore) {
          winner = home.team.abbreviation;
          loser = away.team.abbreviation;
        } else if (awayScore > homeScore) {
          winner = away.team.abbreviation;
          loser = home.team.abbreviation;
        } else {
          winner = 'Tie';
          loser = 'Tie';
        }
      }

      // Team-specific score
      const teamScore = (team === home.team.abbreviation) ? homeScore || 0 :
                        (team === away.team.abbreviation) ? awayScore || 0 : 0;

      // Margin of victory
      const margin = homeScore != null && awayScore != null ? Math.abs(homeScore - awayScore) : 0;

      // Rax calculation
      let baseRax = 0;
      if (winner === team) {
        baseRax = 100 + margin * 2;
      } else if (winner === 'Tie') {
        baseRax = 0;
      } else {
        baseRax = teamScore + CLOSE_GAME_BONUS;
      }

      const raxEarned = baseRax * rarityMultiplier;

      return {
        date: event.date,
        matchup: `${away.team.displayName} @ ${home.team.displayName}`,
        score: homeScore != null && awayScore != null ? `${awayScore} - ${homeScore}` : 'Scheduled',
        W_L: winner === team ? 'W' : winner === 'Tie' ? 'Tie' : 'L',
        baseRax,
        raxEarned: Math.round(raxEarned)
      };
    });

    // Total Rax
    const totalRax = schedule.reduce((acc, g) => acc + g.raxEarned, 0);

    res.status(200).json({ schedule, totalRax });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}