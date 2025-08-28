export default function SportSelector({ selectedSport, onChangeSport }) {
  return (
    <div style={{ margin: "1rem 0" }}>
      <label>Select Sport: </label>
      <select value={selectedSport} onChange={(e) => onChangeSport(e.target.value)}>
        <option value="">--Choose Sport--</option>
        <option value="NHL">NHL</option>
        <option value="NFL">NFL</option>
        <option value="NBA">NBA</option>
      </select>
    </div>
  );
}