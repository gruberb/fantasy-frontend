import { Link, useNavigate } from "react-router-dom";
import { Ranking } from "../api/client";

interface RankingsTableProps {
  rankings: Ranking[] | undefined | null;
  title?: string;
  limit?: number;
}

const RankingsTable = ({
  rankings = [],
  title = "Rankings",
  limit,
}: RankingsTableProps) => {
  const navigate = useNavigate();

  // Check if rankings is an array and not empty
  if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
    return (
      <div>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <p className="text-gray-500">No rankings data available.</p>
      </div>
    );
  }

  // Sort rankings by rank if needed (they should already be sorted)
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  // Apply limit if provided
  const displayRankings = limit
    ? sortedRankings.slice(0, limit)
    : sortedRankings;

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {limit && rankings.length > limit && (
            <Link
              to="/rankings"
              className="text-gray-600 hover:underline flex items-center"
            >
              View All <span className="ml-1">→</span>
            </Link>
          )}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Team</th>
              {/* These columns will be hidden on small screens using responsive classes */}
              <th className="py-3 px-4 text-left hidden md:table-cell">
                Goals
              </th>
              <th className="py-3 px-4 text-left hidden md:table-cell">
                Assists
              </th>
              <th className="py-3 px-4 text-left">Points</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRankings.map((team) => (
              <tr
                key={team.team_id}
                className="border-t transition-colors duration-80 hover:bg-blue-100 cursor-pointer group"
                onClick={() => navigate(`/teams/${team.team_id}`)}
              >
                <td className="py-3 px-4 font-bold">{team.rank}</td>
                <td className="py-3 px-4 transition-all duration-150">
                  {team.team_name}
                </td>
                {/* These cells will be hidden on small screens using responsive classes */}
                <td className="py-3 px-4 hidden md:table-cell">{team.goals}</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {team.assists}
                </td>
                <td className="py-3 px-4">{team.total_points}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/teams/${team.team_id}`}
                    className="text-gray-600 group-hover:underline flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Team
                    <span className="ml-1 text-sm">→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingsTable;
