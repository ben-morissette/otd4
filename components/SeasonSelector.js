import React from "react";

export default function SeasonSelector({ season, setSeason }) {
  return (
    <div>
      <label htmlFor="season">Select Season:</label>
      <input
        type="number"
        id="season"
        min="2000"
        max="2100"
        value={season}
        onChange={(e) => setSeason(e.target.value)}
      />
    </div>
  );
}