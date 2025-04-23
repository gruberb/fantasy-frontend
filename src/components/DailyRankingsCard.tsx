import { Link } from "react-router-dom";

// Interfaces remain the same
interface PlayerHighlight {
  player_name: string;
  points: number;
  nhl_team: string;
  image_url?: string;
  nhl_id?: number;
}

interface RankingItem {
  rank: number;
  team_id: number;
  team_name: string;
  daily_points: number;
  player_highlights: PlayerHighlight[];
}

interface DailyRankingsResponse {
  date: string;
  rankings: RankingItem[];
}

interface DailyRankingsCardProps {
  rankings: DailyRankingsResponse | RankingItem[];
  date: Date;
  title?: string;
  limit?: number;
}

const DailyRankingsCard = ({
  rankings = [],
  date,
  title = "Daily Rankings",
  limit = 5,
}: DailyRankingsCardProps) => {
  let rankingsArray: RankingItem[] = [];

  if (rankings && Array.isArray(rankings)) {
    rankingsArray = rankings;
  } else if (
    rankings &&
    "rankings" in rankings &&
    Array.isArray(rankings.rankings)
  ) {
    rankingsArray = rankings.rankings;
  }

  if (!rankingsArray || rankingsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <p className="text-gray-500">
          No rankings data available for this date.
        </p>
      </div>
    );
  }

  // Format date for display
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Sort rankings by rank
  const sortedRankings = [...rankingsArray].sort((a, b) => a.rank - b.rank);

  // Apply limit if provided
  const displayRankings =
    limit && limit > 0 ? sortedRankings.slice(0, limit) : sortedRankings;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        {limit && limit > 0 && rankingsArray.length > limit && (
          <Link
            to="/games"
            className="text-gray-600 hover:underline flex items-center"
          >
            View Full Results <span className="ml-1">→</span>
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-left">Points</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">
                Top Player
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRankings.map((team) => (
              <tr
                key={team.team_id}
                className="border-t hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-3 px-4 font-bold">{team.rank}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/teams/${team.team_id}`}
                    className="text-gray-800 hover:underline flex items-center"
                  >
                    {team.team_name}
                    <span className="ml-1 text-gray-500 text-sm inline-block">
                      →
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-4 font-semibold">{team.daily_points}</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {team.player_highlights &&
                  team.player_highlights.length > 0 ? (
                    <div className="flex items-center">
                      {team.player_highlights[0].image_url ? (
                        <img
                          src={team.player_highlights[0].image_url}
                          alt={team.player_highlights[0].player_name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : null}
                      <div>
                        {team.player_highlights[0].nhl_id ? (
                          <a
                            href={`https://www.nhl.com/player/${team.player_highlights[0].nhl_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-800 hover:underline flex items-center"
                          >
                            {team.player_highlights[0].player_name}
                            <span className="ml-1 text-gray-500 text-sm inline-block">
                              ↗
                            </span>
                          </a>
                        ) : (
                          <div className="font-medium">
                            {team.player_highlights[0].player_name}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {team.player_highlights[0].points} pts
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyRankingsCard;
