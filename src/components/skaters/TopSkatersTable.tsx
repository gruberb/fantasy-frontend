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
  | "lastName"; // Assuming lastName sort might be based on the player name column

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
    if (seconds == null) return "-"; // Handle null or undefined
    const totalSeconds = Math.round(seconds); // Ensure integer seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const sortedSkaters = [...skaters].sort((a, b) => {
    let comparison = 0;
    const aValue = a.stats?.[sortField as keyof TopSkater["stats"]];
    const bValue = b.stats?.[sortField as keyof TopSkater["stats"]];

    // Handle sorting by player name separately
    if (sortField === "lastName") {
      // Combine first and last for more robust sorting if needed, or just use lastName
      comparison = `${a.lastName}, ${a.firstName}`.localeCompare(
        `${b.lastName}, ${b.firstName}`,
      );
    } else if (aValue == null && bValue == null) {
      comparison = 0;
    } else if (aValue == null) {
      comparison = -1; // Sort nulls/undefined to the beginning or end as desired
    } else if (bValue == null) {
      comparison = 1;
    } else {
      comparison = (aValue as number) - (bValue as number); // Assuming numerical comparison for stats
    }

    // Fallback to points if primary sort fields are equal? (Optional)
    // if (comparison === 0 && sortField !== 'points') {
    //   comparison = (b.stats?.points ?? 0) - (a.stats?.points ?? 0); // Secondary sort by points desc
    // }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    const iconClass = "w-3 h-3 ml-1 inline-block"; // Ensure icon is inline

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

  // Define shared styles for header cells for consistency
  const thBaseClasses =
    "py-4 px-5 whitespace-nowrap text-left text-sm font-semibold tracking-wider";
  const thStickyTopClasses = "sticky top-[62px] z-20 bg-gray-50";

  return (
    // Added overflow-x-auto to allow horizontal scrolling of the table content
    // You might need max-height and overflow-y-auto here if you want vertical scroll contained within this div
    <div
      className="
        overflow-y-auto
        overflow-x-hidden
        h-max                  /* height: max-content; grows with table */
        max-h-[calc(100vh-150px)]  /* cap at viewport-150px */
        relative
        border border-gray-200
        rounded-lg
        shadow-sm
      "
    >
      <table className="w-full table-fixed border-collapse">
        {/* Apply sticky positioning and background to the entire thead is simpler */}
        {/* but applying to TH gives more control over individual backgrounds if needed */}
        <thead>
          <tr className="border-b border-gray-200">
            {/* --- Sticky Header Column 1: Rank --- */}
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} sticky left-0 z-30 w-16 bg-gray-50`} // Highest z-index for corner, fixed width
            >
              #
            </th>
            {/* --- Sticky Header Column 2: Player --- */}
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} sticky left-16 z-30 bg-gray-50`} // left-16 = w-16 of first column
              // No onClick needed for sorting if we use the 'lastName' sortField tied to the name itself
            >
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("lastName")} // Allow sorting by name
              >
                Player {getSortIcon("lastName")}
              </button>
            </th>
            {/* --- Non-Sticky Headers --- */}
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} hidden md:table-cell`}
            >
              Team
            </th>
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} hidden md:table-cell`}
            >
              Pos
            </th>
            <th className={`${thBaseClasses} ${thStickyTopClasses}`}>
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("points")}
              >
                Points {getSortIcon("points")}
              </button>
            </th>
            <th className={`${thBaseClasses} ${thStickyTopClasses}`}>
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("goals")}
              >
                Goals {getSortIcon("goals")}
              </button>
            </th>
            <th className={`${thBaseClasses} ${thStickyTopClasses}`}>
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("assists")}
              >
                Assists {getSortIcon("assists")}
              </button>
            </th>
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} hidden md:table-cell`}
            >
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("plusMinus")}
              >
                +/- {getSortIcon("plusMinus")}
              </button>
            </th>
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} hidden md:table-cell`}
            >
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("penaltyMins")}
              >
                PIM {getSortIcon("penaltyMins")}
              </button>
            </th>
            <th
              className={`${thBaseClasses} ${thStickyTopClasses} hidden lg:table-cell`}
            >
              <button
                className="flex items-center focus:outline-none cursor-pointer"
                onClick={() => handleSort("toi")}
              >
                TOI {getSortIcon("toi")}
              </button>
            </th>
            <th className={`${thBaseClasses} ${thStickyTopClasses}`}>
              Fantasy
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSkaters.map((player, index) => {
            const isInPlayoffs = isTeamInPlayoffs(player.teamAbbrev);
            const isEvenRow = index % 2 === 0;
            // Use Tailwind classes for background and ensure they are applied to sticky cells
            const rowBgClass = isEvenRow ? "bg-white" : "bg-gray-50";
            const tdBaseClass = `py-4 px-5 break-words text-base border-b border-gray-100 ${rowBgClass}`; // Apply bg here
            const tdStickyBaseClass = `sticky z-10 border-b border-gray-100`; // z-10 for body cells, below header

            return (
              <tr
                key={`${player.id}-${index}`} // Using index in key isn't ideal if list can change order other than sorting
                className={`hover:bg-blue-50 ${!isInPlayoffs ? "opacity-60" : ""}`} // Use a different hover color
              >
                {/* --- Sticky Body Column 1: Rank --- */}
                <td
                  className={`${tdBaseClass} ${tdStickyBaseClass} left-0 w-16 font-medium`} // Match width, sticky left
                >
                  {index + 1}
                </td>
                {/* --- Sticky Body Column 2: Player --- */}
                <td
                  className={`${tdBaseClass} ${tdStickyBaseClass} left-16`} // Sticky left, offset by w-16
                >
                  <div className="flex items-center">
                    <div className="ml-0 sm:ml-4">
                      {" "}
                      {/* Adjust margin for small screens */}
                      <a
                        href={`https://www.nhl.com/player/${player.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-gray-900 hover:text-[#6D4C9F] hover:underline block" // Make name block for better layout
                      >
                        {player.firstName} {player.lastName}
                      </a>
                      {player.sweaterNumber && (
                        <span className="text-sm text-gray-500 ml-1">
                          #{player.sweaterNumber}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 block sm:hidden">
                        {/* Show pos/team on small screens */}
                        {player.position} - {player.teamAbbrev}
                      </span>
                    </div>
                  </div>
                </td>
                {/* --- Non-Sticky Body Cells --- */}
                <td className={`${tdBaseClass} hidden md:table-cell`}>
                  {" "}
                  {/* Hide on smallest screens */}
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
                <td className={`${tdBaseClass} hidden md:table-cell`}>
                  {" "}
                  {/* Hide on smallest screens */}
                  {player.position}
                </td>
                <td className={`${tdBaseClass} font-bold`}>
                  {player.stats.points ?? "-"}
                </td>
                <td className={tdBaseClass}>{player.stats.goals ?? "-"}</td>
                <td className={tdBaseClass}>{player.stats.assists ?? "-"}</td>
                <td className={`${tdBaseClass} hidden md:table-cell`}>
                  {player.stats.plusMinus != null ? ( // Check for null/undefined explicitly
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
                <td className={`${tdBaseClass} hidden md:table-cell`}>
                  {player.stats.penaltyMins ?? 0}{" "}
                  {/* Default to 0 if null/undefined */}
                </td>
                <td className={`${tdBaseClass} hidden lg:table-cell`}>
                  {formatTOI(player.stats.toi as number)}{" "}
                  {/* Cast or ensure TOI is number */}
                </td>
                <td className={`${tdBaseClass} whitespace-nowrap`}>
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
          {/* Add a row for no results if needed */}
          {sortedSkaters.length === 0 && !isLoading && (
            <tr>
              <td
                colSpan={12} /* Adjust colSpan based on max visible columns */
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
