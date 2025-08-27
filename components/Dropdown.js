export default function Dropdown({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>{label}: </label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.displayName || opt}
          </option>
        ))}
      </select>
    </div>
  );
}
