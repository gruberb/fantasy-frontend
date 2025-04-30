import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getNHLTeamUrlSlug } from "../../utils/nhlTeams";
import { TopSkater } from "../../types/skaters";
import { usePlayoffsData } from "../../hooks/usePlayoffsData";

interface TopSkatersTableProps {
  skaters: TopSkater[];
  isLoading: boolean;
}

type SortField =
  | "points"
  | "goals"
  | "assists"
  | "plusMinus"
  | "penaltyMins"
  | "faceoffPct"
  | "toi"
  | "lastName";

const TopSkatersTable: React.FC<TopSkatersTableProps> = ({
  skaters,
  isLoading,
}) => {
  const [sortField, setSortField] = useState<SortField>("points");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { isTeamInPlayoffs } = usePlayoffsData();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc for new field
    }
  };

  const formatTOI = (seconds: number): string => {
    if (seconds == null) return "-";
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const sortedSkaters = [...skaters].sort((a, b) => {
    let comparison = 0;
    const aValue = a.stats?.[sortField as keyof TopSkater["stats"]];
    const bValue = b.stats?.[sortField as keyof TopSkater["stats"]];

    if (sortField === "lastName") {
      comparison = `${a.lastName}, ${a.firstName}`.localeCompare(
        `${b.lastName}, ${b.firstName}`,
      );
    } else if (aValue == null && bValue == null) {
      comparison = 0;
    } else if (aValue == null) {
      comparison = -1;
    } else if (bValue == null) {
      comparison = 1;
    } else {
      comparison = (aValue as number) - (bValue as number);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    const iconClass = "w-3 h-3 ml-1 inline-block";

    return sortDirection === "asc" ? (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        ></path>
      </svg>
    ) : (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        ></path>
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {/* Rank column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-12 sticky left-0 z-10 bg-gray-50">
              #
            </th>

            {/* Player column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-left w-56 sticky left-12 z-10 bg-gray-50">
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("lastName")}
              >
                Player {getSortIcon("lastName")}
              </button>
            </th>

            {/* Team column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-left w-28">
              Team
            </th>

            {/* Position column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-left w-20">
              Pos
            </th>

            {/* Points column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-24">
              <button
                className="flex items-center justify-center mx-auto focus:outline-none cursor-pointer"
                onClick={() => handleSort("points")}
              >
                Points {getSortIcon("points")}
              </button>
            </th>

            {/* Goals column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-24">
              <button
                className="flex items-center justify-center mx-auto focus:outline-none cursor-pointer"
                onClick={() => handleSort("goals")}
              >
                Goals {getSortIcon("goals")}
              </button>
            </th>

            {/* Assists column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-24">
              <button
                className="flex items-center justify-center mx-auto focus:outline-none cursor-pointer"
                onClick={() => handleSort("assists")}
              >
                Assists {getSortIcon("assists")}
              </button>
            </th>

            {/* Plus/Minus column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-24">
              <button
                className="flex items-center justify-center mx-auto focus:outline-none cursor-pointer"
                onClick={() => handleSort("plusMinus")}
              >
                +/- {getSortIcon("plusMinus")}
              </button>
            </th>

            {/* PIM column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-24">
              <button
                className="flex items-center justify-center mx-auto focus:outline-none cursor-pointer"
                onClick={() => handleSort("penaltyMins")}
              >
                PIM {getSortIcon("penaltyMins")}
              </button>
            </th>

            {/* TOI column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-24">
              <button
                className="flex items-center justify-center mx-auto focus:outline-none cursor-pointer"
                onClick={() => handleSort("toi")}
              >
                TOI {getSortIcon("toi")}
              </button>
            </th>

            {/* Fantasy column */}
            <th className="py-4 px-5 whitespace-nowrap text-sm font-semibold tracking-wider text-center w-32">
              Fantasy
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSkaters.map((player, index) => {
            const isInPlayoffs = isTeamInPlayoffs(player.teamAbbrev);
            const isEvenRow = index % 2 === 0;
            const rowBgClass = isEvenRow ? "bg-white" : "bg-gray-50";
            const cellBgColor = isEvenRow ? "#ffffff" : "#f9fafb";
            const hoverBgColor = "#eff6ff"; // blue-50

            return (
              <tr
                key={`${player.id}-${index}`}
                className={`${rowBgClass} ${!isInPlayoffs ? "opacity-60" : ""} hover:bg-blue-50`}
                onMouseEnter={(e) => {
                  const stickyCells =
                    e.currentTarget.querySelectorAll("td.sticky");
                  stickyCells.forEach((cell) => {
                    (cell as HTMLElement).style.backgroundColor = hoverBgColor;
                  });
                }}
                onMouseLeave={(e) => {
                  const stickyCells =
                    e.currentTarget.querySelectorAll("td.sticky");
                  stickyCells.forEach((cell) => {
                    (cell as HTMLElement).style.backgroundColor = cellBgColor;
                  });
                }}
              >
                {/* Rank column */}
                <td
                  className="py-4 px-5 text-center font-medium border-b border-gray-100 sticky left-0 z-10 sticky"
                  style={{ backgroundColor: cellBgColor }}
                >
                  {index + 1}
                </td>

                {/* Player column */}
                <td
                  className="py-4 px-5 text-left border-b border-gray-100 sticky left-12 z-10 sticky"
                  style={{ backgroundColor: cellBgColor }}
                >
                  <div className="flex items-center">
                    <div className="ml-0">
                      <a
                        href={`https://www.nhl.com/player/${player.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-gray-900 hover:text-[#6D4C9F] hover:underline block"
                      >
                        {player.firstName} {player.lastName}
                      </a>
                      {player.sweaterNumber && (
                        <span className="text-sm text-gray-500 ml-1">
                          #{player.sweaterNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Team column */}
                <td className="py-4 px-5 border-b border-gray-100">
                  <a
                    href={`https://www.nhl.com/${getNHLTeamUrlSlug(player.teamAbbrev)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center group"
                  >
                    <div className="flex items-center">
                      {player.teamLogo ? (
                        <img
                          src={player.teamLogo}
                          alt={player.teamAbbrev}
                          className="h-6 w-6 mr-2"
                        />
                      ) : null}
                      <span className="text-base text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                        {player.teamAbbrev}
                      </span>
                    </div>
                  </a>
                </td>

                {/* Position column */}
                <td className="py-4 px-5 border-b border-gray-100">
                  {player.position}
                </td>

                {/* Points column */}
                <td className="py-4 px-5 text-center font-bold border-b border-gray-100">
                  {player.stats.points ?? "-"}
                </td>

                {/* Goals column */}
                <td className="py-4 px-5 text-center border-b border-gray-100">
                  {player.stats.goals ?? "-"}
                </td>

                {/* Assists column */}
                <td className="py-4 px-5 text-center border-b border-gray-100">
                  {player.stats.assists ?? "-"}
                </td>

                {/* Plus/Minus column */}
                <td className="py-4 px-5 text-center border-b border-gray-100">
                  {player.stats.plusMinus != null ? (
                    <span
                      className={
                        player.stats.plusMinus > 0
                          ? "text-green-600"
                          : player.stats.plusMinus < 0
                            ? "text-red-600"
                            : ""
                      }
                    >
                      {player.stats.plusMinus > 0 ? "+" : ""}
                      {player.stats.plusMinus}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                {/* PIM column */}
                <td className="py-4 px-5 text-center border-b border-gray-100">
                  {player.stats.penaltyMins ?? 0}
                </td>

                {/* TOI column */}
                <td className="py-4 px-5 text-center border-b border-gray-100">
                  {formatTOI(player.stats.toi as number)}
                </td>

                {/* Fantasy column */}
                <td className="py-4 px-5 text-center whitespace-nowrap border-b border-gray-100">
                  {player.fantasyTeam ? (
                    <Link
                      to={`/fantasy-teams/${player.fantasyTeam.teamId}`}
                      className="text-base text-[#6D4C9F] hover:underline"
                    >
                      {player.fantasyTeam.teamName}
                    </Link>
                  ) : (
                    <span className="text-base text-gray-500">—</span>
                  )}
                </td>
              </tr>
            );
          })}
          {sortedSkaters.length === 0 && !isLoading && (
            <tr>
              <td
                colSpan={11}
                className="text-center py-10 px-5 text-gray-500 bg-white"
              >
                No skaters found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopSkatersTable;
