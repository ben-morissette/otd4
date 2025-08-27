export const RARITY_MULTIPLIERS = {
  General: 1,
  Common: 1.2,
  Uncommon: 1.4,
  Rare: 1.6,
  Epic: 2,
  Leg: 2.5,
  Mystic: 4,
  Iconic: 6
};

export function calculateRax(game, teamName, rarity = "General", sport = "NHL") {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1;

  let homeScore = typeof game.homeScore === "object" ? game.homeScore.value || 0 : 0;
  let awayScore = typeof game.awayScore === "object" ? game.awayScore.value || 0 : 0;

  let winner = "";
  if (homeScore > awayScore) winner = game.homeTeam;
  else if (awayScore > homeScore) winner = game.awayTeam;
  else winner = "Tie";

  let baseRax = 0;

  if (winner === teamName) {
    if (sport === "NHL") baseRax = game.type === "Playoffs" ? 20 + 20 * Math.abs(homeScore - awayScore) : 12 * Math.abs(homeScore - awayScore);
    else if (sport === "NFL") baseRax = 100 + 2 * Math.abs(homeScore - awayScore);
    else if (sport === "NBA") baseRax = game.type === "Playoffs" ? 30 + 2.5 * Math.abs(homeScore - awayScore) : 2.5 * Math.abs(homeScore - awayScore);
  } else {
    baseRax = sport === "NFL" ? (winner === "Tie" ? 0 : homeScore + 5) : 0;
  }

  return baseRax * rarityMultiplier;
}
