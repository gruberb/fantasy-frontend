import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useFantasyTeams } from "../../hooks/useFantasyTeams";
import { dateStringToLocalDate, isSameLocalDay } from "../../utils/timezone";
import { getNHLTeamUrlSlug } from "../../utils/nhlTeams";
import type { SkaterWithPoints } from "../../types/skaters";
import React from "react";

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

  // Track which teams are collapsed
  const [collapsedTeams, setCollapsedTeams] = useState<Set<number>>(new Set());

  // Update sort when date or game status changes
  useEffect(() => {
    setSortBy(getDefaultSort());
  }, [selectedDate, hasLiveGames, getDefaultSort]);

  // Toggle team collapse state
  const toggleTeamCollapse = (teamId: number) => {
    setCollapsedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Collapse or expand all teams
  const toggleAllTeams = () => {
    if (collapsedTeams.size === fantasyTeamCounts.length) {
      // If all teams are collapsed, expand all
      setCollapsedTeams(new Set());
    } else {
      // Otherwise collapse all
      setCollapsedTeams(new Set(fantasyTeamCounts.map((t) => t.teamId)));
    }
  };

  // sorted array of teams
  const sortedTeams = [...fantasyTeamCounts].sort((a, b) => {
    if (sortBy === "totalPoints") return b.totalPoints - a.totalPoints;
    return b.playerCount - a.playerCount;
  });

  // Check if all teams are collapsed
  const allTeamsCollapsed = collapsedTeams.size === fantasyTeamCounts.length;

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
            No fantasy teams have players in today's games.
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
                  <span>Total players found:</span>
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
                  <span>First game players:</span>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Fantasy Teams
          </h2>
          <p className="text-sm text-gray-500">
            {fantasyTeamCounts.length} teams with players{" "}
            {hasLiveGames ? "in action" : "for this date"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 shadow-sm p-1">
            <button
              onClick={() => setSortBy("playerCount")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === "playerCount"
                  ? "bg-[#6D4C9F] text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Players
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
            onClick={toggleAllTeams}
            className="px-3 py-1.5 bg-[#041E42]/10 text-[#041E42] rounded-md hover:bg-[#041E42]/20 transition-colors text-sm font-medium shadow-sm border border-[#041E42]/10 flex items-center"
          >
            <svg
              className={`w-4 h-4 mr-1.5 transition-transform ${
                allTeamsCollapsed ? "" : "rotate-180"
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
            {allTeamsCollapsed ? "Expand All" : "Collapse All"}
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTeams.map((team) => (
              <React.Fragment key={team.teamId}>
                <tr className="bg-white text-black">
                  {/* <tr className="bg-gradient-to-r from-[#7FC6DB] to-[#D4FAFA] text-white"> */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <Link
                          to={`/fantasy-teams/${team.teamId}`}
                          className="font-medium hover:text-[#6D4C9F] hover:underline"
                        >
                          {team.teamName}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        team.totalPoints > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {team.totalPoints}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {team.playerCount}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleTeamCollapse(team.teamId)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center mx-auto"
                    >
                      <span className="hidden sm:block">
                        {collapsedTeams.has(team.teamId) ? "Show" : "Hide"}{" "}
                        Players
                      </span>
                      <svg
                        className={`ml-1 w-4 h-4 transform transition-transform ${
                          collapsedTeams.has(team.teamId) ? "" : "rotate-180"
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
                    </button>
                  </td>
                </tr>

                {/* Player details - initially expanded */}
                {!collapsedTeams.has(team.teamId) && (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="bg-gray-50 p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {team.players.map(
                            (player: SkaterWithPoints, idx: number) => (
                              <div
                                key={idx}
                                className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between"
                              >
                                <div className="flex items-center pr-2 min-w-0">
                                  {player.imageUrl ? (
                                    <img
                                      src={player.imageUrl}
                                      alt={player.playerName || ""}
                                      className="w-8 h-8 rounded-full mr-2 border border-gray-100 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                      <span className="text-xs font-medium">
                                        {(player.playerName || "")
                                          .substring(0, 2)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate">
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
                                          className="w-3 h-3 mr-1 flex-shrink-0"
                                        />
                                      )}
                                      <span className="truncate">
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
                                  className={`text-sm font-bold px-2 py-1 rounded-md flex-shrink-0 ${
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
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FantasyTeamSummary;
