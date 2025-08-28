export default function SeasonSelector({ season, onChangeSeason }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>Season: </label>
      <input
        type="number"
        value={season}
        min="2000"
        max="2100"
        onChange={(e) => onChangeSeason(Number(e.target.value))}
      />
    </div>
  );
}