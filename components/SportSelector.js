// components/SportSelector.js
export default function SportSelector({ selectedSport, onChangeSport }) {
  const sports = ["NHL", "NFL", "NBA"];
  return (
    <div style={{ margin: "1rem 0" }}>
      <label>Select Sport: </label>
      <select
        value={selectedSport}
        onChange={(e) => onChangeSport(e.target.value)}
      >
        <option value="">--Choose Sport--</option>
        {sports.map((sport) => (
          <option key={sport} value={sport}>
            {sport}
          </option>
        ))}
      </select>
    </div>
  );
}