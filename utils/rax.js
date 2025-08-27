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

// Minimal example to calculate RAX from ESPN schedule JSON
export function calculateRax(data, sport, rarity) {
  const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
  const events = data.events || [];
  const schedule = events.map((event) => {
    let homeScore = event.competitions?.[0]?.competitors?.find(c => c.homeAway === "home")?.score || 0;
    let awayScore = event.competitions?.[0]?.competitors?.find(c => c.homeAway === "away")?.score || 0;
    const winner = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "tie";
    const margin = Math.abs(homeScore - awayScore);
    const baseRax = winner === "home" ? 100 + margin * 2 : winner === "away" ? 0 : 50;
    const raxEarned = baseRax * multiplier;
    return {
      date: event.date,
      name: event.name,
      homeScore,
      awayScore,
      winner,
      margin,
      baseRax,
      raxEarned
    };
  });

  const totalRax = schedule.reduce((acc, row) => acc + row.raxEarned, 0);
  return { schedule, totalRax };
