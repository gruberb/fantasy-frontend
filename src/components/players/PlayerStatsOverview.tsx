interface PositionCount {
  position: string;
  count: number;
}

interface PlayerStatsOverviewProps {
  totalPlayers: number;
  filteredPlayers: number;
  positionCounts: PositionCount[];
}

export default function PlayerStatsOverview({
  totalPlayers,
  filteredPlayers,
  positionCounts,
}: PlayerStatsOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
      <div className="flex flex-wrap gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total Players</div>
          <div className="text-xl font-bold">{totalPlayers}</div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Filtered Players</div>
          <div className="text-xl font-bold">{filteredPlayers}</div>
        </div>

        {positionCounts.map(({ position, count }) => (
          <div
            key={position}
            className="bg-gray-50 p-3 rounded-lg hidden sm:table-cell"
          >
            <div className="text-sm text-gray-600">{position}</div>
            <div className="text-xl font-bold">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
