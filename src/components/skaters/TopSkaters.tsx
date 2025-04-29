import { useEffect, useMemo } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import TopSkatersTable from "../skaters/TopSkatersTable";
import { useSkaters } from "../../hooks/useSkaters";

const SkatersPage = () => {
  const {
    allSkaters,
    filteredSkaters,
    positions,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    positionFilter,
    setPositionFilter,
    inPlayoffsFilter,
    setInPlayoffsFilter,
  } = useSkaters();

  // Calculate position counts based on filtered skaters (not all skaters)
  const filteredPositionCounts = useMemo(() => {
    if (!filteredSkaters || !Array.isArray(filteredSkaters)) return [];

    const counts = {};
    filteredSkaters.forEach((skater) => {
      counts[skater.position] = (counts[skater.position] || 0) + 1;
    });

    return Object.entries(counts).map(([position, count]) => ({
      position,
      count,
    }));
  }, [filteredSkaters]);

  // Log the number of filtered skaters for debugging
  useEffect(() => {
    console.log("SkatersPage - allSkaters length:", allSkaters.length);
    console.log(
      "SkatersPage - filteredSkaters length:",
      filteredSkaters.length,
    );
  }, [allSkaters.length, filteredSkaters.length]);

  if (error) {
    return (
      <div>
        <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">NHL Skaters</h1>
        </div>
        <ErrorMessage
          message="Failed to load skaters data. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header section with filters */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">NHL Skaters</h1>
        <p className="text-lg opacity-90 mb-4">
          Browse and search the top NHL skaters of the season
        </p>

        {/* Filters */}
        <div className="bg-white/10 p-4 rounded-lg shadow-sm mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Position
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Positions</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Playoff Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Playoff Status
              </label>
              <select
                value={inPlayoffsFilter}
                onChange={(e) => setInPlayoffsFilter(e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Players</option>
                <option value="in">In Playoffs</option>
                <option value="out">Eliminated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Total Skaters</div>
            <div className="text-xl font-bold">{allSkaters.length}</div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Filtered Skaters</div>
            <div className="text-xl font-bold">{filteredSkaters.length}</div>
          </div>

          {/* Use filteredPositionCounts instead of positionCounts to show accurate numbers */}
          {filteredPositionCounts.map(({ position, count }) => (
            <div key={position} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">{position}</div>
              <div className="text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skaters Table */}
      {isLoading ? (
        <LoadingSpinner size="large" message="Loading skaters data..." />
      ) : (
        <TopSkatersTable skaters={filteredSkaters} isLoading={isLoading} />
      )}
    </div>
  );
};

export default SkatersPage;
