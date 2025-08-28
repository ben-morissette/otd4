export default function SportSelector({ sport, setSport }) {
  const sports = [
    { value: "football", label: "NFL" },
    { value: "basketball", label: "NBA" },
    { value: "hockey", label: "NHL" }
  ];

  return (
    <select
      className="border p-2 rounded w-full"
      value={sport}
      onChange={(e) => setSport(e.target.value)}
    >
      <option value="">Select Sport</option>
      {sports.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}