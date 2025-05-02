import { useState, useMemo, useRef, useEffect } from "react";
import { RankingTableProps } from "./types";
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

  // Date picker props with defaults
  showDatePicker = false,
  selectedDate,
  onDateChange,
}: RankingTableProps) => {
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
    if (!showRankColors) return "rank-indicator rank-indicator-default";

    if (rank === 1) return "rank-indicator rank-indicator-1";
    if (rank === 2) return "rank-indicator rank-indicator-2";
    if (rank === 3) return "rank-indicator rank-indicator-3";
    return "rank-indicator rank-indicator-default";
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

  // Find name column (usually the second column after rank)
  const nameColumnIndex = columns.findIndex((col) => col.key !== rankField);
  const hasNameColumn = nameColumnIndex !== -1;

  return (
    <div className={`ranking-table-container ${className}`}>
      {/* Header section */}
      <div className="ranking-table-header">
        <RankingTableHeader
          title={title}
          subtitle={subtitle}
          viewAllLink={viewAllLink}
          viewAllText={viewAllText}
          showViewAll={!!limit && safeData.length > limit}
          dateBadge={showDatePicker ? undefined : dateBadge}
          showDatePicker={showDatePicker}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      </div>
      {isLoading && (
        <div className="p-6">
          <LoadingSpinner message="Loading data..." />
        </div>
      )}
      {(!safeData || safeData.length === 0) && !isLoading && (
        <div className="p-6">
          <RankingTableEmpty message={emptyMessage} />
        </div>
      )}

      {/* Table */}
      {!isLoading && safeData && safeData.length > 0 && (
        <div>
          <div className="ranking-table-body">
            <div
              ref={tableContainerRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ position: "relative" }}
            >
              <table ref={tableRef} className="ranking-table">
                <thead>
                  <tr>
                    {/* Rank column (sticky) */}
                    <th className="sticky left-0 z-20 bg-gray-50 text-center">
                      {columns.find((col) => col.key === rankField)?.header ||
                        "Rank"}
                    </th>

                    {/* Name column (sticky if found) */}
                    {hasNameColumn && (
                      <th
                        className="sticky z-20 border-l border-gray-50 sticky-shadow bg-gray-50"
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
                            className={`${responsiveClass} ${column.className || ""}`}
                          >
                            {column.sortable ? (
                              <button
                                className="focus:outline-none cursor-pointer"
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
                      <tr key={key} className="hover:bg-[#f8f7ff]">
                        {/* Rank column (sticky) */}
                        <td
                          className="sticky left-0 z-10 text-center bg-white"
                          style={{ width: "50px" }}
                        >
                          <div className={getRankColor(Number(rankValue))}>
                            {rankValue}
                          </div>
                        </td>

                        {/* Name column (sticky if found) */}
                        {hasNameColumn && (
                          <td
                            className="sticky z-10 border-l border-gray-50 bg-white"
                            style={{ left: "65px" }}
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
                                className={`${responsiveClass} ${column.className || ""}`}
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
          <>
            <style jsx global>{`
              .scrollbar-hide {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none; /* Chrome, Safari and Opera */
              }
            `}</style>
          </>
          {/* Scroll indicator - only show when scrollable */}
          {isScrollable && (
            <div className="table-scroll-indicator">
              <span className="hidden sm:inline">⟷ Scroll for more</span>
              <span className="sm:hidden">⟷ Swipe for more</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RankingTable;
