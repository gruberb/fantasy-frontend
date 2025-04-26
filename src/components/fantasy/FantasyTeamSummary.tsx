import { useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import { Link } from "react-router-dom";
import { useFantasyTeams } from "../../hooks/useFantasyTeams";
import type { PlayerWithPoints } from "../../types/players";

interface FantasyTeamSummaryProps {
  selectedDate: string;
}

const FantasyTeamSummary: React.FC<FantasyTeamSummaryProps> = ({
  selectedDate,
}) => {
  const { gamesData, teams, fantasyTeamCounts, isLoading } =
    useFantasyTeams(selectedDate);

  // purely UI state
  const [sortBy, setSortBy] = useState<
    "playerCount" | "teamName" | "totalPoints"
  >("playerCount");
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [expandAll, setExpandAll] = useState<boolean>(false);

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
    if (sortBy === "teamName") return a.teamName.localeCompare(b.teamName);
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
          <p>Teams loaded: {teams?.length || 0}</p>
          {gamesData?.games && gamesData.games.length > 0 && (
            <p>
              First game has {gamesData.games[0].homeTeamPlayers?.length || 0}{" "}
              home players and {gamesData.games[0].awayTeamPlayers?.length || 0}{" "}
              away players
            </p>
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
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "playerCount" | "teamName" | "totalPoints",
                )
              }
              className="text-sm border border-gray-300 rounded-md p-1 focus:ring-[#6D4C9F] focus:border-[#6D4C9F]"
            >
              <option value="playerCount">Player Count</option>
              <option value="teamName">Team Name</option>
              <option value="totalPoints">Total Points</option>
            </select>
          </div>

          <button
            onClick={toggleExpandAll}
            className="text-sm px-3 py-1 bg-[#6D4C9F]/10 text-[#6D4C9F] rounded-md hover:bg-[#6D4C9F]/20 transition-colors"
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
                    to={`/teams/${team.teamId}`}
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
                      (player: PlayerWithPoints, idx: number) => (
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
                                {player.playerName}
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
                                  {player.nhlTeam}{" "}
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
