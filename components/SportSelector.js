export default function SportSelector({ sports, selectedSport, onChange }) {
  return (
    <select
      className="border p-2 rounded"
      value={selectedSport}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Sport</option>
      {sports.map((sport) => (
        <option key={sport.id} value={sport.id}>
          {sport.name}
        </option>
      ))}
    </select>
  );
}