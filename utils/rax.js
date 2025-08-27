export const calculateRax = (teamStats) => {
  // Example: sum wins + some weight for score
  const rax = teamStats.reduce((acc, game) => acc + (game.win ? 3 : 0), 0);
  return rax;
};
