import { Link, useNavigate } from "react-router-dom";
import { Ranking } from "../../types/rankings";

interface RankingsTableProps {
  rankings: Ranking[] | undefined | null;
  title?: string;
  limit?: number;
}

const RankingsTable = ({
  rankings = [],
  title = " Overall Rankings",
  limit,
}: RankingsTableProps) => {
  const navigate = useNavigate();

  // Check if rankings is an array and not empty
  if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
    return (
      <div>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
          <p className="text-gray-500">No rankings data available.</p>
        </div>
      </div>
    );
  }

  // Sort rankings by rank
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  // Apply limit if provided
  const displayRankings = limit
    ? sortedRankings.slice(0, limit)
    : sortedRankings;

  // Helper to get rank color
  const getRankColor = (rank: number): string => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-white";
  };

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {limit && rankings.length > limit && (
            <Link
              to="/rankings"
              className="text-[#6D4C9F] hover:text-[#5A3A87] flex items-center font-medium transition-colors"
            >
              View All <span className="ml-1">→</span>
            </Link>
          )}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                Team
              </th>
              {/* These columns will be hidden on small screens using responsive classes */}
              <th className="py-3 px-4 text-left hidden md:table-cell text-sm font-semibold text-gray-700">
                Goals
              </th>
              <th className="py-3 px-4 text-left hidden md:table-cell text-sm font-semibold text-gray-700">
                Assists
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRankings.map((team) => (
              <tr
                key={team.teamId}
                className="border-b border-gray-50 transition-colors duration-150 hover:bg-[#f8f7ff] cursor-pointer"
                onClick={() => navigate(`/teams/${team.teamId}`)}
              >
                <td className="py-3 px-4">
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(team.rank)}`}
                  >
                    {team.rank}
                  </div>
                </td>
                <td className="py-3 px-4 font-medium">{team.teamName}</td>
                {/* These cells will be hidden on small screens using responsive classes */}
                <td className="py-3 px-4 hidden md:table-cell">{team.goals}</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {team.assists}
                </td>
                <td className="py-3 px-4 font-bold">{team.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingsTable;
