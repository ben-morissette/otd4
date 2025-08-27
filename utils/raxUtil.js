const RaxUtil = {
  calculate(events) {
    // Example calculation: 1 point per game
    if (!events) return 0;
    return events.length;
  }
};

export default RaxUtil;
