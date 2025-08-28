export default function SeasonSelector({ season, setSeason }) {
  return (
    <div>
      <label>Season: </label>
      <input
        type="number"
        value={season}
        min="2000"
        max="2100"
        onChange={e => setSeason(e.target.value)}
      />
    </div>
  );
}