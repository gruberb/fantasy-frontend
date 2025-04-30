import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
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
    return <LoadingSpinner message="Processing fantasy team data…" />;
  }

  if (fantasyTeamCounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Fantasy Teams</h2>
        <div className="text-center py-4 text-gray-500">
          No fantasy teams have players in today's games.
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Games loaded: {gamesData?.games?.length || 0}</p>
          {gamesData?.games && gamesData.games.length > 0 && (
            <>
              <p>
                Total players found:{" "}
                {gamesData.games.reduce(
                  (total, game) =>
                    total +
                    (game.homeTeamPlayers?.length || 0) +
                    (game.awayTeamPlayers?.length || 0),
                  0,
                )}
              </p>
              <p>
                First game has {gamesData.games[0].homeTeamPlayers?.length || 0}{" "}
                home players and{" "}
                {gamesData.games[0].awayTeamPlayers?.length || 0} away players
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-bold">Fantasy Teams</h2>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2 md:mt-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-select" className="text-sm text-gray-600">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "playerCount" | "totalPoints")
                }
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D4C9F]/20 focus:border-[#6D4C9F] hover:border-[#6D4C9F]/50 transition-colors cursor-pointer"
              >
                <option value="playerCount">Player Count</option>
                <option value="totalPoints">Total Points</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={toggleExpandAll}
            className="text-sm px-3 py-1.5 bg-[#6D4C9F]/10 text-[#6D4C9F] rounded-md hover:bg-[#6D4C9F]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D4C9F]/30"
          >
            {expandAll ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTeams.map((team) => (
          <div
            key={team.teamId}
            className="border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleTeamExpansion(team.teamId)}
            >
              <div className="flex items-center">
                {team.teamLogo ? (
                  <img
                    src={team.teamLogo}
                    alt={team.teamName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#6D4C9F]/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-[#6D4C9F]">
                      {team.teamName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    to={`/fantasy-teams/${team.teamId}`}
                    className="font-medium hover:text-[#6D4C9F] hover:underline"
                  >
                    {team.teamName}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {team.playerCount} player
                    {team.playerCount !== 1 ? "s" : ""} • {team.totalPoints} pts
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform ${
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

            {(expandedTeams.has(team.teamId) || expandAll) && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                  Players
                </div>
                {team.players.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {team.players.map(
                      (player: SkaterWithPoints, idx: number) => (
                        <div
                          key={idx}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.playerName || ""}
                                className="w-8 h-8 rounded-full mr-2"
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
                              <div className="text-sm font-medium">
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
                                    className="w-4 h-4 mr-1"
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
                          <div className="text-sm font-bold">
                            {player.points || 0} pts
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No player details available
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
