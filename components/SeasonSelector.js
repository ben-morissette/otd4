export default function SeasonSelector({ season, setSeason }) {
  return (
    <div>
      <label>Season: </label>
      <input
        type="number"
        min="2000"
        max="2100"
        value={season}
        onChange={(e) => setSeason(Number(e.target.value))}
      />
    </div>
  );
}