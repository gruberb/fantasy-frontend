import { Link } from "react-router-dom";

// Define the expected structure based on the actual API response
interface PlayerHighlight {
  playerName: string;
  points: number;
  nhlTeam: string;
  imageUrl?: string;
  nhlId?: number;
}

interface RankingItem {
  rank: number;
  teamId: number;
  teamName: string;
  dailyPoints: number;
  playerHighlights: PlayerHighlight[];
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center py-6 border border-gray-100">
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
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="text-center py-4">
          <p className="text-red-500">
            Failed to load fantasy scores for this date.
          </p>
        </div>
      </div>
    );
  }

  if (!rankingsArray || rankingsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
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
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedRankings.map((team) => (
          <div
            key={team.teamId}
            className="border border-gray-100 rounded-md p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-2 ${
                    team.rank === 1
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : team.rank === 2
                        ? "bg-gray-100 text-gray-800 border border-gray-200"
                        : team.rank === 3
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : "bg-white border border-gray-200"
                  }`}
                >
                  {team.rank}
                </div>
                <Link
                  to={`/teams/${team.teamId}`}
                  className="font-medium hover:text-[#6D4C9F] hover:underline"
                >
                  {team.teamName}
                </Link>
              </div>
              <div className="text-lg font-bold">{team.dailyPoints} pts</div>
            </div>

            {team.playerHighlights && team.playerHighlights.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Top performers:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {team.playerHighlights.slice(0, 2).map((player, idx) => (
                    <div key={idx} className="flex items-center">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.playerName}
                          className="w-6 h-6 rounded-full mr-1"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-[#6D4C9F]/10 rounded-full flex items-center justify-center mr-1">
                          <span className="text-xs font-medium text-[#6D4C9F]">
                            {player.playerName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {player.nhlId ? (
                        <a
                          href={`https://www.nhl.com/player/${player.nhlId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-[#6D4C9F] hover:underline flex items-center"
                        >
                          <span>
                            {player.playerName}: {player.points} pts
                          </span>
                          <svg
                            className="w-3 h-3 ml-1 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span>
                          {player.playerName}: {player.points} pts
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameDaySummary;
