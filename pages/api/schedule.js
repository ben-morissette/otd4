import axios from "axios";

const RARITY_MULTIPLIERS = {
  General: 1,
  Common: 1.2,
  Uncommon: 1.4,
  Rare: 1.6,
  Epic: 2,
  Leg: 2.5,
  Mystic: 4,
  Iconic: 6,
};

const NHL_RAX = { regular: 12, playoff_base: 20, playoff_mult: 20 };
const NFL_RAX = { win_base: 100, win_mult: 2, close_game_bonus: 5 };
const NBA_RAX = { win_mult: 2.5, playoff_base: 30 };

export default async function handler(req, res) {
  try {
    const { sport, team, season, rarity = "General" } = req.query;
    if (!sport || !team || !season) {
      return res.status(400).json({ error: "Missing required query params" });
    }

    const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;
    let schedule = [];
    let totalRax = 0;

    if (sport === "NHL") {
      const url = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=2`;
      const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team}/schedule?season=${season}&seasontype=3`;
      const [regResp, playoffResp] = await Promise.all([axios.get(url), axios.get(playoffUrl)]);
      const regEvents = regResp.data.events || [];
      const playoffEvents = playoffResp.data.events || [];

      for (let ev of regEvents) {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");
        const winner = comp.competitors.find(c => c.winner)?.team.abbreviation || null;
        const margin = Math.abs((home.score || 0) - (away.score || 0));
        const rax = winner === team ? NHL_RAX.regular * margin * rarityMultiplier : 0;
        schedule.push({ date: ev.date, matchup: ev.name, score: `${away.score || 0} - ${home.score || 0}`, type: "Regular Season", winner, rax_earned: rax });
        totalRax += rax;
      }

      for (let ev of playoffEvents) {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");
        const winner = comp.competitors.find(c => c.winner)?.team.abbreviation || null;
        const margin = Math.abs((home.score || 0) - (away.score || 0));
        const rax = winner === team ? (NHL_RAX.playoff_base + NHL_RAX.playoff_mult * margin) * rarityMultiplier : 0;
        schedule.push({ date: ev.date, matchup: ev.name, score: `${away.score || 0} - ${home.score || 0}`, type: "Playoffs", winner, rax_earned: rax });
        totalRax += rax;
      }
    }

    if (sport === "NFL") {
      const url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?season=${season}`;
      const resp = await axios.get(url);
      const events = resp.data.events || [];

      for (let ev of events) {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");
        const winner = comp.competitors.find(c => c.winner)?.team.abbreviation || null;
        const margin = Math.abs((home.score || 0) - (away.score || 0));
        const teamScore = team === home.team.abbreviation ? home.score : away.score;
        const rax = winner === team ? (NFL_RAX.win_base + NFL_RAX.win_mult * margin) * rarityMultiplier : (teamScore + NFL_RAX.close_game_bonus) * rarityMultiplier;
        schedule.push({ date: ev.date, matchup: `${away.team.abbreviation} at ${home.team.abbreviation}`, score: `${away.score || 0} - ${home.score || 0}`, type: "Regular Season", winner, rax_earned: rax });
        totalRax += rax;
      }
    }

    if (sport === "NBA") {
      const url = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=2`;
      const playoffUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule?season=${season}&seasontype=3`;
      const [regResp, playoffResp] = await Promise.all([axios.get(url), axios.get(playoffUrl)]);
      const regEvents = regResp.data.events || [];
      const playoffEvents = playoffResp.data.events || [];

      for (let ev of regEvents) {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");
        const winner = comp.competitors.find(c => c.winner)?.team.abbreviation || null;
        const margin = Math.abs((home.score || 0) - (away.score || 0));
        const rax = winner === team ? NBA_RAX.win_mult * margin * rarityMultiplier : 0;
        schedule.push({ date: ev.date, matchup: ev.name, score: `${away.score || 0} - ${home.score || 0}`, type: "Regular Season", winner, rax_earned: rax });
        totalRax += rax;
      }

      for (let ev of playoffEvents) {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === "home");
        const away = comp.competitors.find(c => c.homeAway === "away");
        const winner = comp.competitors.find(c => c.winner)?.team.abbreviation || null;
        const margin = Math.abs((home.score || 0) - (away.score || 0));
        const rax = winner === team ? (NBA_RAX.playoff_base + margin) * rarityMultiplier : 0;
        schedule.push({ date: ev.date, matchup: ev.name, score: `${away.score || 0} - ${home.score || 0}`, type: "Playoffs", winner, rax_earned: rax });
        totalRax += rax;
      }
    }

    res.status(200).json({ schedule, totalRax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}