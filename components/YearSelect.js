import React from "react";

export default function YearSelect({ selectedYear, onChange }) {
  const years = Array.from({ length: 10 }, (_, i) => 2025 - i);
  return (
    <select value={selectedYear} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Year</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}
