import { Link } from "react-router-dom";
import { toLocalDateString } from "../utils/timezone";

// Interfaces remain the same
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
  limit = 7,
}: DailyRankingsCardProps) => {
  let rankingsArray: RankingItem[] = [];
  console.log("drc", date);
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <p className="text-gray-500">
          No rankings data available for this date.
        </p>
      </div>
    );
  }

  // Format date for display
  const formattedDate = toLocalDateString(new Date(date));
  // const formattedDate = dateStringToLocalDate(date);

  // Sort rankings by rank
  const sortedRankings = [...rankingsArray].sort((a, b) => a.rank - b.rank);

  // Apply limit if provided
  const displayRankings =
    limit && limit > 0 ? sortedRankings.slice(0, limit) : sortedRankings;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Player
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {displayRankings.map((team) => (
              <tr
                key={team.teamId}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
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
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Link
                    to={`/teams/${team.teamId}`}
                    className="text-gray-900 hover:text-[#6D4C9F] hover:underline font-medium flex items-center"
                  >
                    {team.teamName}
                  </Link>
                </td>
                <td className="py-3 px-4 font-semibold whitespace-nowrap">
                  {team.dailyPoints}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {team.playerHighlights && team.playerHighlights.length > 0 ? (
                    <div className="flex items-center">
                      {team.playerHighlights[0].imageUrl ? (
                        <img
                          src={team.playerHighlights[0].imageUrl}
                          alt={team.playerHighlights[0].playerName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#6D4C9F]/10 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-[#6D4C9F]">
                            {team.playerHighlights[0].playerName
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        {team.playerHighlights[0].nhlId ? (
                          <a
                            href={`https://www.nhl.com/player/${team.playerHighlights[0].nhlId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-[#6D4C9F] hover:underline flex items-center font-medium"
                          >
                            {/* Full name for md and above */}
                            <span className="hidden md:inline">
                              {team.playerHighlights[0].playerName}
                            </span>
                            {/* Abbreviated name for small screens */}
                            <span className="md:hidden">
                              {(() => {
                                const nameParts =
                                  team.playerHighlights[0].playerName.split(
                                    " ",
                                  );
                                return nameParts.length >= 2
                                  ? `${nameParts[1]} ${nameParts[0].charAt(0)}.`
                                  : team.playerHighlights[0].playerName;
                              })()}
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
                          <div className="font-medium text-gray-900">
                            <span className="hidden md:inline">
                              {team.playerHighlights[0].playerName}
                            </span>
                            <span className="md:hidden">
                              {(() => {
                                const nameParts =
                                  team.playerHighlights[0].playerName.split(
                                    " ",
                                  );
                                return nameParts.length >= 2
                                  ? `${nameParts[1]} ${nameParts[0].charAt(0)}.`
                                  : team.playerHighlights[0].playerName;
                              })()}
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {team.playerHighlights[0].points} pts
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
