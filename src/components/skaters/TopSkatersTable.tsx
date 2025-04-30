import React, { useState, useRef, useEffect } from "react";
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
  const [stickyTopOffset, setStickyTopOffset] = useState(62); // Default value

  // Calculate the top offset for sticky elements
  useEffect(() => {
    const calculateTopOffset = () => {
      // Try to get the main navigation height
      const mainNav =
        document.querySelector("nav") ||
        document.querySelector("header") ||
        document.querySelector(".navbar");

      if (mainNav) {
        // Get the actual height + a small buffer
        const navHeight = mainNav.getBoundingClientRect().height + 1;
        setStickyTopOffset(0);

        // Also set as CSS variable for potential use
        document.documentElement.style.setProperty(
          "--header-height",
          `${navHeight}px`,
        );
      }
    };

    // Calculate immediately and on resize
    calculateTopOffset();
    window.addEventListener("resize", calculateTopOffset);

    return () => {
      window.removeEventListener("resize", calculateTopOffset);
    };
  }, []);

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

  // Define basic cell styles for reuse
  const baseHeaderStyle = {
    padding: "1rem 1.25rem",
    whiteSpace: "nowrap" as const,
    fontSize: "0.875rem",
    fontWeight: 600 as const,
    letterSpacing: "0.025em",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  };

  const stickyHeaderStyle = {
    ...baseHeaderStyle,
    position: "sticky" as const,
    top: `${stickyTopOffset}px`,
    zIndex: 20,
  };

  const stickyLeftHeaderStyle = (leftPosition: string) => ({
    ...stickyHeaderStyle,
    left: leftPosition,
    zIndex: 30,
  });

  const baseCellStyle = (isEven: boolean) => ({
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #f3f4f6",
    backgroundColor: isEven ? "#ffffff" : "#f9fafb",
  });

  const stickyLeftCellStyle = (isEven: boolean, leftPosition: string) => ({
    ...baseCellStyle(isEven),
    position: "sticky" as const,
    left: leftPosition,
    zIndex: 10,
  });

  return (
    <>
      {/* The key change: Add a div with position: relative that wraps the entire table */}
      <div
        style={{ position: "relative" }}
        className="border border-gray-200 rounded-lg shadow-sm"
      >
        {/* This div needs overflow-x: auto but NOT overflow-y: auto/hidden */}
        <div style={{ overflowX: "auto", overflowY: "visible" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr className="border-b border-gray-200">
                {/* Rank column - sticky left and top */}
                <th
                  style={{
                    ...stickyLeftHeaderStyle("0"),
                    width: "3rem",
                    textAlign: "center",
                  }}
                >
                  #
                </th>

                {/* Player column - sticky left and top */}
                <th
                  style={{
                    ...stickyLeftHeaderStyle("3rem"),
                    width: "14rem",
                    textAlign: "left",
                  }}
                >
                  <button
                    className="flex items-center focus:outline-none cursor-pointer"
                    onClick={() => handleSort("lastName")}
                  >
                    Player {getSortIcon("lastName")}
                  </button>
                </th>

                {/* Regular header cells - only sticky top */}
                {[
                  {
                    id: "team",
                    label: "Team",
                    width: "7rem",
                    align: "left",
                    sortField: null,
                  },
                  {
                    id: "pos",
                    label: "Pos",
                    width: "5rem",
                    align: "left",
                    sortField: null,
                  },
                  {
                    id: "points",
                    label: "Points",
                    width: "6rem",
                    align: "center",
                    sortField: "points",
                  },
                  {
                    id: "goals",
                    label: "Goals",
                    width: "6rem",
                    align: "center",
                    sortField: "goals",
                  },
                  {
                    id: "assists",
                    label: "Assists",
                    width: "6rem",
                    align: "center",
                    sortField: "assists",
                  },
                  {
                    id: "plusMinus",
                    label: "+/-",
                    width: "6rem",
                    align: "center",
                    sortField: "plusMinus",
                  },
                  {
                    id: "pim",
                    label: "PIM",
                    width: "6rem",
                    align: "center",
                    sortField: "penaltyMins",
                  },
                  {
                    id: "toi",
                    label: "TOI",
                    width: "6rem",
                    align: "center",
                    sortField: "toi",
                  },
                  {
                    id: "fantasy",
                    label: "Fantasy",
                    width: "8rem",
                    align: "center",
                    sortField: null,
                  },
                ].map((col) => (
                  <th
                    key={col.id}
                    style={{
                      ...stickyHeaderStyle,
                      width: col.width,
                      textAlign: col.align === "center" ? "center" : "left",
                    }}
                  >
                    {col.sortField ? (
                      <button
                        className={`flex items-center ${col.align === "center" ? "justify-center mx-auto" : ""} focus:outline-none cursor-pointer`}
                        onClick={() => handleSort(col.sortField as SortField)}
                      >
                        {col.label} {getSortIcon(col.sortField as SortField)}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSkaters.map((player, index) => {
                const isInPlayoffs = isTeamInPlayoffs(player.teamAbbrev);
                const isEvenRow = index % 2 === 0;

                return (
                  <tr
                    key={`${player.id}-${index}`}
                    className={`${!isInPlayoffs ? "opacity-60" : ""} hover:bg-blue-50`}
                  >
                    {/* Rank Column - Sticky Left */}
                    <td
                      style={{
                        ...stickyLeftCellStyle(isEvenRow, "0"),
                        width: "3rem",
                        textAlign: "center",
                        fontWeight: 500,
                      }}
                    >
                      {index + 1}
                    </td>

                    {/* Player Column - Sticky Left */}
                    <td
                      style={{
                        ...stickyLeftCellStyle(isEvenRow, "3rem"),
                        width: "14rem",
                        textAlign: "left",
                      }}
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

                    {/* Team Cell */}
                    <td style={{ ...baseCellStyle(isEvenRow) }}>
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

                    {/* Position Cell */}
                    <td style={{ ...baseCellStyle(isEvenRow) }}>
                      {player.position}
                    </td>

                    {/* Points Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {player.stats.points ?? "-"}
                    </td>

                    {/* Goals Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                      }}
                    >
                      {player.stats.goals ?? "-"}
                    </td>

                    {/* Assists Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                      }}
                    >
                      {player.stats.assists ?? "-"}
                    </td>

                    {/* +/- Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                      }}
                    >
                      {player.stats.plusMinus != null ? (
                        <span
                          style={{
                            color:
                              player.stats.plusMinus > 0
                                ? "#059669" // green-600
                                : player.stats.plusMinus < 0
                                  ? "#DC2626" // red-600
                                  : "inherit",
                          }}
                        >
                          {player.stats.plusMinus > 0 ? "+" : ""}
                          {player.stats.plusMinus}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* PIM Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                      }}
                    >
                      {player.stats.penaltyMins ?? 0}
                    </td>

                    {/* TOI Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                      }}
                    >
                      {formatTOI(player.stats.toi as number)}
                    </td>

                    {/* Fantasy Cell */}
                    <td
                      style={{
                        ...baseCellStyle(isEvenRow),
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
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
      </div>

      {/* Add a CSS block to ensure sticky positioning works properly */}
      <style jsx>{`
        /* Critical fix for sticky headers to work at viewport level */
        thead th {
          position: sticky;
          z-index: 20;
        }

        /* These styles ensure proper sticky behavior */
        tbody td.sticky-left {
          position: sticky !important;
          z-index: 10;
        }

        /* Force proper background colors */
        tr:hover td {
          background-color: #eff6ff !important;
        }

        /* For browsers that need it: ensure the sticky elements work with proper overflow */
        @supports (-webkit-overflow-scrolling: touch) {
          .overflow-y-visible {
            overflow-y: visible !important;
          }
        }
      `}</style>
    </>
  );
};

export default TopSkatersTable;
