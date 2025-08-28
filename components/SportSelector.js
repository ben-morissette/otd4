export default function SportSelector({ sports, onSelect }) {
  return (
    <select
      className="border p-2 w-full"
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select Sport</option>
      {sports.map((sport, idx) => (
        <option key={idx} value={sport.id}>{sport.name}</option>
      ))}
    </select>
  );
}