import { Link } from "react-router-dom";
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
            <Link to="/rankings" className="text-blue-600 hover:underline">
              View All →
            </Link>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-left">Goals</th>
              <th className="py-3 px-4 text-left">Assists</th>
              <th className="py-3 px-4 text-left">Points</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRankings.map((team) => (
              <tr key={team.team_id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-bold">{team.rank}</td>
                <td className="py-3 px-4">{team.team_name}</td>
                <td className="py-3 px-4">{team.goals}</td>
                <td className="py-3 px-4">{team.assists}</td>
                <td className="py-3 px-4">{team.total_points}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/teams/${team.team_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Team
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
