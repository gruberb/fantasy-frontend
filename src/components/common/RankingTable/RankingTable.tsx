import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RankingTableProps, RankingData } from "./types";
import RankingTableHeader from "./RankingTableHeader";
import RankingTableEmpty from "./RankingTableEmpty";
import LoadingSpinner from "../LoadingSpinner";

const RankingTable = ({
  // Core data props
  data,
  columns,
  keyField = "id",
  rankField = "rank",

  // Display options
  title,
  subtitle,
  limit,
  viewAllLink,
  viewAllText = "View All",
  dateBadge,

  // State flags
  isLoading = false,
  emptyMessage = "No data available.",

  // Styling
  className = "",
  showRankColors = true,

  // Behavior
  initialSortKey,
  initialSortDirection = "desc",
  onRowClick,
}: RankingTableProps) => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Check if table is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (tableContainerRef.current && tableRef.current) {
        const containerWidth = tableContainerRef.current.clientWidth;
        const tableWidth = tableRef.current.clientWidth;
        setIsScrollable(tableWidth > containerWidth);
      }
    };

    // Check initially
    checkScrollable();

    // Check on window resize
    window.addEventListener("resize", checkScrollable);
    return () => {
      window.removeEventListener("resize", checkScrollable);
    };
  }, []);

  // Set default sort field from the first sortable column or first column
  const defaultSortKey =
    initialSortKey ||
    columns.find((col) => col.sortable)?.key ||
    columns[0]?.key;

  // Sorting state
  const [sortKey, setSortKey] = useState<string>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection,
  );

  // Handle sort change
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // Helper to get rank color
  const getRankColor = (rank: number): string => {
    if (!showRankColors) return "bg-white border border-gray-200";

    if (rank === 1)
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 border border-gray-200";
    if (rank === 3)
      return "bg-orange-100 text-orange-800 border border-orange-200";
    return "bg-white border border-gray-200";
  };

  // Safely ensure data is an array
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Sort and limit items
  const displayItems = useMemo(() => {
    if (safeData.length === 0) return [];

    // Create a copy for sorting
    let result = [...safeData];

    // Apply sorting
    result.sort((a, b) => {
      // Get values for the sort key
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Default return (handles undefined, etc.)
      return 0;
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [safeData, sortKey, sortDirection, limit]);

  // Default row click handler
  const handleRowClick = (item: RankingData) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (item.teamId) {
      // Default navigation to fantasy team detail if teamId exists
      navigate(`/fantasy-teams/${item.teamId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <LoadingSpinner message="Loading data..." />
      </div>
    );
  }

  // Empty state
  if (!safeData || safeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <RankingTableEmpty message={emptyMessage} />
      </div>
    );
  }

  // Find name column (usually the second column after rank)
  const nameColumnIndex = columns.findIndex((col) => col.key !== rankField);
  const hasNameColumn = nameColumnIndex !== -1;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}
    >
      {/* Header section */}
      <RankingTableHeader
        title={title}
        subtitle={subtitle}
        viewAllLink={viewAllLink}
        viewAllText={viewAllText}
        showViewAll={!!limit && safeData.length > limit}
        dateBadge={dateBadge}
      />
      {/* Table */}
      <div className="overflow-hidden">
        <div
          ref={tableContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{ position: "relative" }}
        >
          <table ref={tableRef} className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {/* Rank column (sticky) */}
                <th className="bg-white py-3 px-4 text-left text-sm font-semibold text-gray-700 sticky left-0 z-20">
                  {columns.find((col) => col.key === rankField)?.header ||
                    "Rank"}
                </th>

                {/* Name column (sticky if found) */}
                {hasNameColumn && (
                  <th
                    className="bg-white py-3 px-4 text-left text-sm font-semibold text-gray-700 sticky z-20 border-l border-gray-50 sticky-shadow"
                    style={{ left: "65px" }}
                  >
                    {columns[nameColumnIndex].header}
                  </th>
                )}

                {/* Other columns (scrollable) */}
                {columns
                  .filter(
                    (col, idx) =>
                      col.key !== rankField && idx !== nameColumnIndex,
                  )
                  .map((column) => {
                    // Determine responsive class
                    let responsiveClass = "";
                    if (column.responsive === "md") {
                      responsiveClass = "hidden md:table-cell";
                    } else if (column.responsive === "lg") {
                      responsiveClass = "hidden lg:table-cell";
                    }

                    return (
                      <th
                        key={column.key}
                        className={`py-3 px-4 text-left text-sm font-semibold text-gray-700 ${responsiveClass} ${column.className || ""}`}
                      >
                        {column.sortable ? (
                          <button
                            className="flex items-center focus:outline-none cursor-pointer"
                            onClick={() => handleSort(column.key)}
                          >
                            {column.header}
                            {sortKey === column.key && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, index) => {
                const key = item[keyField] || index;
                const rankValue = item[rankField] || index + 1;

                return (
                  <tr
                    key={key}
                    className="border-b border-gray-50 hover:bg-[#f8f7ff] cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    {/* Rank column (sticky) */}
                    <td
                      className="py-3 px-4 sticky left-0 z-10"
                      style={{ width: "50px", background: "white" }}
                    >
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(Number(rankValue))}`}
                      >
                        {rankValue}
                      </div>
                    </td>

                    {/* Name column (sticky if found) */}
                    {hasNameColumn && (
                      <td
                        className="py-3 px-4 sticky z-10 border-l border-gray-50"
                        style={{
                          left: "65px",
                          background: "white",
                        }}
                      >
                        {columns[nameColumnIndex].render
                          ? columns[nameColumnIndex].render(
                              item[columns[nameColumnIndex].key],
                              item,
                              index,
                            )
                          : item[columns[nameColumnIndex].key]}
                      </td>
                    )}

                    {/* Other columns (scrollable) */}
                    {columns
                      .filter(
                        (col, idx) =>
                          col.key !== rankField && idx !== nameColumnIndex,
                      )
                      .map((column) => {
                        // Get cell value
                        const value = item[column.key];

                        // Determine responsive class
                        let responsiveClass = "";
                        if (column.responsive === "md") {
                          responsiveClass = "hidden md:table-cell";
                        } else if (column.responsive === "lg") {
                          responsiveClass = "hidden lg:table-cell";
                        }

                        // Use custom renderer if provided
                        return (
                          <td
                            key={column.key}
                            className={`py-3 px-4 ${responsiveClass} ${column.className || ""}`}
                          >
                            {column.render
                              ? column.render(value, item, index)
                              : value}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add scrollbar hiding and shadow styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      {/* Scroll indicator - only show when scrollable */}
      {isScrollable && (
        <div className="p-1 text-xs text-center text-gray-400 border-t border-gray-100">
          <span className="hidden sm:inline">⟷ Scroll for more</span>
          <span className="sm:hidden">⟷ Swipe for more</span>
        </div>
      )}
    </div>
  );
};

export default RankingTable;
