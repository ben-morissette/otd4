import Select from "react-select";

export default function TeamSelect({ teams, value, onChange }) {
  const selected = teams.find((t) => t.value === value) || null;
  return (
    <div>
      <label>Select Team:</label>
      <Select
        options={teams}
        value={selected}
        onChange={(option) => onChange(option.value)}
      />
    </div>
  );
}
