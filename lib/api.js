import axios from "axios";

export const RARITY_MULTIPLIERS = {
  "General": 1,
  "Common": 1.2,
  "Uncommon": 1.4,
  "Rare": 1.6,
  "Epic": 2,
  "Leg": 2.5,
  "Mystic": 4,
  "Iconic": 6
};

// Get teams dynamically from ESPN
export async function getTeams(sport) {
  const urls = {
    NHL: "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams",
    NFL: "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams",
    NBA: "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams"
  };
  try {
    const res = await axios.get(urls[sport]);
    const data = res.data;
    const teams = {};
    for (const team of data.sports[0].leagues[0].teams) {
      teams[team.team.abbreviation] = team.team.displayName;
    }
    return teams;
  } catch (err) {
    console.error(err);
    return {};
  }
}

// Rax calculation for NHL (example)
export function calculateNHLRax(scoreDiff, isPlayoff, rarity="General") {
  const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
  if (isPlayoff) {
    return (20 + 20 * scoreDiff) * multiplier;
  } else {
    return (12 * scoreDiff) * multiplier;
  }
}

// NFL
export function calculateNFLRax(teamScore, scoreDiff, won, rarity="General") {
  const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
  const closeBonus = 5;
  if (won) return (100 + 2 * scoreDiff) * multiplier;
  return (teamScore + closeBonus) * multiplier;
}

// NBA
export function calculateNBARax(scoreDiff, isPlayoff, rarity="General") {
  const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
  if (isPlayoff) return (30 + scoreDiff * 1) * multiplier;
  return (scoreDiff * 2.5) * multiplier;
}
