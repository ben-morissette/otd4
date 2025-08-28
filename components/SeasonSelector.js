export default function SeasonSelector({ selectedSeason, onChangeSeason }) {
  return (
    <div style={{ margin: "1rem 0" }}>
      <label>Season: </label>
      <input
        type="number"
        value={selectedSeason}
        onChange={(e) => onChangeSeason(e.target.value)}
        min="2000"
        max="2100"
      />
    </div>
  );
}