import { Link } from "react-router-dom";

// Define the expected structure based on the actual API response
interface PlayerHighlight {
  player_name: string;
  points: number;
  nhl_team: string;
  image_url?: string;
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

interface GameDaySummaryProps {
  rankings: DailyRankingsResponse | RankingItem[];
  isLoading?: boolean;
  error?: unknown;
}

const GameDaySummary = ({
  rankings,
  isLoading = false,
  error = null,
}: GameDaySummaryProps) => {
  console.log("GameDaySummary received rankings:", rankings);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 text-center py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center py-4">
          <p className="text-red-500">
            Failed to load fantasy scores for this date.
          </p>
        </div>
      </div>
    );
  }

  // Extract rankings array based on the structure
  let rankingsArray: RankingItem[] = [];

  if (rankings && Array.isArray(rankings)) {
    // If it's already an array, use it directly
    rankingsArray = rankings;
  } else if (
    rankings &&
    "rankings" in rankings &&
    Array.isArray(rankings.rankings)
  ) {
    // If it's an object with a rankings property, use that
    rankingsArray = rankings.rankings;
  }

  console.log("Extracted rankings array:", rankingsArray);

  if (!rankingsArray || rankingsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center py-4">
          <p className="text-gray-500">
            No fantasy scores available for this date.
          </p>
        </div>
      </div>
    );
  }

  // Sort rankings by rank
  const sortedRankings = [...rankingsArray].sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">Fantasy Scores</h3>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedRankings.map((team) => (
            <div
              key={team.team_id}
              className="border rounded-md p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                    <span className="font-bold">{team.rank}</span>
                  </div>
                  <Link
                    to={`/teams/${team.team_id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {team.team_name}
                  </Link>
                </div>
                <div className="text-lg font-bold">{team.daily_points} pts</div>
              </div>

              {team.player_highlights && team.player_highlights.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">Top performers:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {team.player_highlights.slice(0, 2).map((player, idx) => (
                      <div key={idx} className="flex items-center">
                        {player.image_url ? (
                          <img
                            src={player.image_url}
                            alt={player.player_name}
                            className="w-6 h-6 rounded-full mr-1"
                          />
                        ) : null}
                        <span>
                          {player.player_name}: {player.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDaySummary;
