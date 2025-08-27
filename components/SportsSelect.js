import React from "react";

const sports = ["NFL", "NBA", "NHL", "MLB", "CBB", "CFB"];

export default function SportsSelect({ selectedSport, onChange }) {
  return (
    <select value={selectedSport} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Sport</option>
      {sports.map((sport) => (
        <option key={sport} value={sport}>
          {sport}
        </option>
      ))}
    </select>
  );
}
