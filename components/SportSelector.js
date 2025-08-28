export default function SportSelector({ sport, setSport }) {
  return (
    <div>
      <label>Select Sport: </label>
      <select value={sport} onChange={(e) => setSport(e.target.value)}>
        <option value="">--Choose Sport--</option>
        <option value="NFL">NFL</option>
        <option value="NBA">NBA</option>
        <option value="NHL">NHL</option>
      </select>
    </div>
  );
}