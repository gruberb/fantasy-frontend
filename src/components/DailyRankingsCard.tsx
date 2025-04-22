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
  console.log("DailyRankingsCard received rankings:", rankings);

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

  // Check if rankings array is empty
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
          <Link to="/games" className="text-blue-600 hover:underline">
            View Full Results →
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-left">Daily Points</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">
                Top Player
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRankings.map((team) => (
              <tr key={team.team_id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-bold">{team.rank}</td>
                <td className="py-3 px-4">{team.team_name}</td>
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
                        <div className="font-medium">
                          {team.player_highlights[0].player_name}
                        </div>
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
