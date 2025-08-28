"use client";
import React from "react";

export default function ScheduleTable({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return <p className="text-gray-500">No schedule available.</p>;
  }

  const formatDate = (isoString) => {
    const options = { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" };
    return new Date(isoString).toLocaleString("en-US", options);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b text-left">Date</th>
            <th className="px-4 py-2 border-b text-left">Matchup</th>
            <th className="px-4 py-2 border-b text-center">Score</th>
            <th className="px-4 py-2 border-b text-center">Status</th>
            <th className="px-4 py-2 border-b text-center">RAX</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((game, index) => {
            const home = game.competitions[0].competitors.find((t) => t.homeAway === "home");
            const away = game.competitions[0].competitors.find((t) => t.homeAway === "away");

            const homeScore = home.score ? home.score : "-";
            const awayScore = away.score ? away.score : "-";
            const matchup = `${away.team.displayName} @ ${home.team.displayName}`;
            const status = game.status?.type?.description || "Scheduled";

            // ✅ Simple RAX logic: 3 pts for win, 1 for loss, 0 if not played
            let raxPoints = 0;
            if (home.winner !== undefined) {
              if (home.winner) raxPoints = 3; // home win
              else if (away.winner) raxPoints = 1; // away win
            }

            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{formatDate(game.date)}</td>
                <td className="px-4 py-2 border-b">{matchup}</td>
                <td className="px-4 py-2 border-b text-center">{awayScore} - {homeScore}</td>
                <td className="px-4 py-2 border-b text-center">{status}</td>
                <td className="px-4 py-2 border-b text-center">{raxPoints.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}