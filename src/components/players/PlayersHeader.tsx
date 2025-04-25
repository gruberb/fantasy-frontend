interface PlayersHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  positionFilter: string;
  setPositionFilter: (position: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  positions: string[];
  inPlayoffsFilter: string;
  setInPlayoffsFilter: (status: string) => void;
  groupByTeam: boolean;
  setGroupByTeam: (group: boolean) => void;
}

export default function PlayersHeader({
  searchTerm,
  setSearchTerm,
  positionFilter,
  setPositionFilter,
  sortBy,
  setSortBy,
  positions,
  inPlayoffsFilter,
  setInPlayoffsFilter,
  groupByTeam,
  setGroupByTeam,
}: PlayersHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-3xl font-bold mb-2">NHL Players</h1>
      <p className="text-lg opacity-90 mb-4">
        Browse and search all fantasy hockey players
      </p>

      {/* Filters */}
      <div className="bg-white/10 p-4 rounded-lg shadow-sm mb-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

          {/* Sort By Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="points">Total Points</option>
              <option value="name">Player Name</option>
              <option value="team">Fantasy Team</option>
              <option value="nhlTeam">NHL Team</option>
            </select>
          </div>

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

          {/* Checkbox Filter */}
          <div className="flex items-end">
            <div className="flex h-8">
              <input
                type="checkbox"
                id="groupByTeam"
                checked={groupByTeam}
                onChange={(e) => setGroupByTeam(e.target.checked)}
                className="mr-2 h-4 w-4 text-white focus:ring-2 focus:ring-white/50 border border-white/20 rounded"
              />
              <label
                htmlFor="groupByTeam"
                className="text-sm font-medium text-white"
              >
                Group by Fantasy Team
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
