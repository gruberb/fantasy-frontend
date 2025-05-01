import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useFantasyTeams } from "../../hooks/useFantasyTeams";
import { dateStringToLocalDate, isSameLocalDay } from "../../utils/timezone";
import { getNHLTeamUrlSlug } from "../../utils/nhlTeams";
import type { SkaterWithPoints } from "../../types/skaters";

interface FantasyTeamSummaryProps {
  selectedDate: string;
}

const FantasyTeamSummary: React.FC<FantasyTeamSummaryProps> = ({
  selectedDate,
}) => {
  const { gamesData, fantasyTeamCounts, isLoading } =
    useFantasyTeams(selectedDate);

  // Determine if there are live games
  const hasLiveGames =
    gamesData?.games?.some(
      (game) => (game.gameState || "").toUpperCase() === "LIVE",
    ) || false;

  // Convert selectedDate to Date object
  const selectedDateObj = dateStringToLocalDate(selectedDate);
  const today = new Date();
  const isToday = isSameLocalDay(selectedDateObj, today);
  const isFuture = selectedDateObj > today;
  const isPast = selectedDateObj < today && !isToday;

  // Determine default sort based on date and game status
  const getDefaultSort = useCallback((): "playerCount" | "totalPoints" => {
    if (hasLiveGames) {
      return "totalPoints";
    }
    if (isPast) {
      return "totalPoints";
    }
    if (isToday || isFuture) {
      return "playerCount";
    }
    return "playerCount"; // fallback
  }, [hasLiveGames, isPast, isToday, isFuture]);

  // Initialize state with computed default
  const [sortBy, setSortBy] = useState<"playerCount" | "totalPoints">(
    getDefaultSort(),
  );
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [expandAll, setExpandAll] = useState<boolean>(false);

  // Update sort when date or game status changes
  useEffect(() => {
    setSortBy(getDefaultSort());
  }, [selectedDate, hasLiveGames, getDefaultSort]);

  // toggle a single team
  const toggleTeamExpansion = (teamId: number) => {
    if (expandAll) setExpandAll(false);
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  // expand/collapse all
  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandAll(false);
      setExpandedTeams(new Set());
    } else {
      setExpandAll(true);
      setExpandedTeams(new Set(fantasyTeamCounts.map((t) => t.teamId)));
    }
  };

  // sorted array of teams
  const sortedTeams = [...fantasyTeamCounts].sort((a, b) => {
    if (sortBy === "totalPoints") return b.totalPoints - a.totalPoints;
    return b.playerCount - a.playerCount;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-40"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (fantasyTeamCounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
        <div className="text-center py-10">
          <div className="bg-[#6D4C9F]/5 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-[#6D4C9F]/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Fantasy Teams
          </h3>
          <p className="text-gray-500 mb-4">
            No fantasy teams have skaters in today's games.
          </p>

          <div className="p-4 bg-gray-50 rounded-lg text-left text-sm text-gray-500 max-w-md mx-auto">
            <p className="flex justify-between mb-1">
              <span>Games loaded:</span>
              <span className="font-medium">
                {gamesData?.games?.length || 0}
              </span>
            </p>
            {gamesData?.games && gamesData.games.length > 0 && (
              <>
                <p className="flex justify-between mb-1">
                  <span>Total skaters found:</span>
                  <span className="font-medium">
                    {gamesData.games.reduce(
                      (total, game) =>
                        total +
                        (game.homeTeamPlayers?.length || 0) +
                        (game.awayTeamPlayers?.length || 0),
                      0,
                    )}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>First game skaters:</span>
                  <span className="font-medium">
                    {gamesData.games[0].homeTeamPlayers?.length || 0} home,{" "}
                    {gamesData.games[0].awayTeamPlayers?.length || 0} away
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Fantasy Teams
          </h2>
          <p className="text-sm text-gray-500">
            {fantasyTeamCounts.length} teams with skaters{" "}
            {hasLiveGames ? "in action" : "for this date"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 shadow-sm p-1">
            <button
              onClick={() => setSortBy("playerCount")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === "playerCount"
                  ? "bg-[#6D4C9F] text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Skaters
            </button>
            <button
              onClick={() => setSortBy("totalPoints")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === "totalPoints"
                  ? "bg-[#6D4C9F] text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Points
            </button>
          </div>

          <button
            onClick={toggleExpandAll}
            className="px-3 py-1.5 bg-[#041E42]/10 text-[#041E42] rounded-md hover:bg-[#041E42]/20 transition-colors text-sm font-medium shadow-sm border border-[#041E42]/10 flex items-center"
          >
            <svg
              className={`w-4 h-4 mr-1.5 transition-transform ${
                expandAll ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {expandAll ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTeams.map((team) => (
          <div
            key={team.teamId}
            className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
            style={{ boxShadow: "0 4px 12px -2px rgba(109, 76, 159, 0.08)" }}
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-[#F9F8FF] to-white border border-gray-200"
              onClick={() => toggleTeamExpansion(team.teamId)}
            >
              <div className="flex items-center">
                {team.teamLogo ? (
                  <img
                    src={team.teamLogo}
                    alt={team.teamName}
                    className="w-10 h-10 rounded-full mr-3 bg-white p-1 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#6D4C9F]/10 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <span className="text-sm font-medium text-[#6D4C9F]">
                      {team.teamName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    to={`/fantasy-teams/${team.teamId}`}
                    className="font-medium text-gray-800 hover:text-[#6D4C9F] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {team.teamName}
                  </Link>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span
                      className={`font-medium ${sortBy === "playerCount" ? "text-[#041E42]" : ""}`}
                    >
                      {team.playerCount} skater
                      {team.playerCount !== 1 ? "s" : ""}
                    </span>
                    <span className="mx-1">•</span>
                    <span
                      className={`font-medium ${sortBy === "totalPoints" ? "text-[#041E42]" : ""}`}
                    >
                      {team.totalPoints} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated expand/collapse icon */}
              <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-gray-100">
                <svg
                  className={`w-4 h-4 text-gray-500 transform transition-transform ${
                    expandedTeams.has(team.teamId) || expandAll
                      ? "rotate-180"
                      : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {(expandedTeams.has(team.teamId) || expandAll) && (
              <div className="border-x border-b border-gray-200 bg-white rounded-b-xl overflow-hidden">
                <div className="px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 border-y border-gray-100">
                  Skaters ({team.players.length})
                </div>

                {team.players.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {team.players.map(
                      (player: SkaterWithPoints, idx: number) => (
                        <div
                          key={idx}
                          className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center pr-2">
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.playerName || ""}
                                className="w-8 h-8 rounded-full mr-2 border border-gray-100"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-medium">
                                  {(player.playerName || "")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {player.nhlId ? (
                                  <a
                                    href={`https://www.nhl.com/player/${player.nhlId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#6D4C9F] hover:underline"
                                  >
                                    {player.playerName}
                                  </a>
                                ) : (
                                  player.playerName
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                {player.teamLogo && (
                                  <img
                                    src={player.teamLogo}
                                    alt={player.nhlTeam || ""}
                                    className="w-3 h-3 mr-1"
                                  />
                                )}
                                <span>
                                  {player.nhlTeam ? (
                                    <a
                                      href={`https://www.nhl.com/${getNHLTeamUrlSlug(player.nhlTeam)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-[#6D4C9F] hover:underline"
                                    >
                                      {player.nhlTeam}
                                    </a>
                                  ) : (
                                    player.nhlTeam
                                  )}{" "}
                                  {player.position
                                    ? `• ${player.position}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Points indicator */}
                          <div
                            className={`text-sm font-bold px-2 py-1 rounded-md ${
                              (player.points || 0) > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {player.points || 0} pts
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No skater details available
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FantasyTeamSummary;
