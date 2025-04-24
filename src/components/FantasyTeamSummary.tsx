// src/components/FantasyTeamSummary.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Player } from "../api/client";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";

interface PlayerWithPoints extends Player {
  fantasyTeam?: string;
  playerName?: string;
  points?: number;
  goals?: number;
  assists?: number;
  position?: string;
  gameId?: number;
  nhlTeam?: string;
}

interface FantasyTeamCount {
  teamId: number;
  teamName: string;
  teamLogo?: string;
  playerCount: number;
  players: PlayerWithPoints[];
  totalPoints: number;
}

interface FantasyTeamSummaryProps {
  selectedDate: string;
}

const FantasyTeamSummary: React.FC<FantasyTeamSummaryProps> = ({
  selectedDate,
}) => {
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [fantasyTeamCounts, setFantasyTeamCounts] = useState<
    FantasyTeamCount[]
  >([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<
    "playerCount" | "teamName" | "totalPoints"
  >("playerCount");
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [nameToIdMap, setNameToIdMap] = useState<Record<string, number>>({});

  // Fetch team points data
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  // Fetch games data
  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", selectedDate],
    queryFn: () => api.getGames(selectedDate),
  });

  // Create a mapping of team names to IDs
  useEffect(() => {
    if (teams && Array.isArray(teams)) {
      const nameMap: Record<string, number> = {};

      teams.forEach((team) => {
        // Map both full team name and lowercase version for case-insensitive matching
        nameMap[team.name] = team.id;
        nameMap[team.name.toLowerCase()] = team.id;

        // If team has abbreviated name, map that too
        if (team.abbreviation) {
          nameMap[team.abbreviation] = team.id;
          nameMap[team.abbreviation.toLowerCase()] = team.id;
        }
      });

      setNameToIdMap(nameMap);
    }
  }, [teams]);

  // Process data to count players per fantasy team
  useEffect(() => {
    if (
      gamesData?.games &&
      teams &&
      !teamsLoading &&
      !gamesLoading &&
      Object.keys(nameToIdMap).length > 0
    ) {
      setIsProcessing(true);

      try {
        const fantasyTeamMap = new Map<number, FantasyTeamCount>();

        // Initialize all fantasy teams with zero players
        teams.forEach((team) => {
          fantasyTeamMap.set(team.id, {
            teamId: team.id,
            teamName: team.name,
            teamLogo: team.teamLogo,
            playerCount: 0,
            players: [],
            totalPoints: 0,
          });
        });

        // Create a mapping from fantasy team names to team objects
        const nameToTeamMap = new Map<string, FantasyTeamCount>();
        teams.forEach((team) => {
          nameToTeamMap.set(
            team.name.toLowerCase(),
            fantasyTeamMap.get(team.id)!,
          );
        });

        // Count players in today's games
        gamesData.games.forEach((game) => {
          // Process home team players
          if (game.homeTeamPlayers) {
            game.homeTeamPlayers.forEach((player: any) => {
              if (player.fantasyTeam) {
                // Try to find the team ID using the name map
                const teamId =
                  nameToIdMap[player.fantasyTeam] ||
                  nameToIdMap[player.fantasyTeam.toLowerCase()];

                if (teamId !== undefined) {
                  const team = fantasyTeamMap.get(teamId);
                  if (team) {
                    team.playerCount++;
                    const playerPoints =
                      typeof player.points === "number" ? player.points : 0;
                    team.totalPoints += playerPoints;

                    const playerWithGameInfo = {
                      ...player,
                      gameId: game.id,
                      nhlTeam: game.homeTeam,
                      teamLogo: game.homeTeamLogo,
                    };

                    team.players.push(playerWithGameInfo);
                  }
                } else {
                  // If we don't have this team in our map yet, check if it's a new team name
                  // This handles the case where the fantasy team name doesn't exactly match team names

                  // For now, we'll just log this case
                  console.log(
                    `No team ID found for fantasy team: ${player.fantasyTeam}`,
                  );

                  // Create a pseudo-team entry for this name
                  if (!fantasyTeamMap.has(-1)) {
                    const pseudoTeam: FantasyTeamCount = {
                      teamId: -1,
                      teamName: player.fantasyTeam,
                      playerCount: 0,
                      players: [],
                      totalPoints: 0,
                    };
                    fantasyTeamMap.set(-1, pseudoTeam);
                  }

                  const pseudoTeam = fantasyTeamMap.get(-1)!;
                  pseudoTeam.playerCount++;
                  const playerPoints =
                    typeof player.points === "number" ? player.points : 0;
                  pseudoTeam.totalPoints += playerPoints;

                  const playerWithGameInfo = {
                    ...player,
                    gameId: game.id,
                    nhlTeam: game.homeTeam,
                    teamLogo: game.homeTeamLogo,
                  };

                  pseudoTeam.players.push(playerWithGameInfo);
                }
              }
            });
          }

          // Process away team players
          if (game.awayTeamPlayers) {
            game.awayTeamPlayers.forEach((player: any) => {
              if (player.fantasyTeam) {
                // Try to find the team ID using the name map
                const teamId =
                  nameToIdMap[player.fantasyTeam] ||
                  nameToIdMap[player.fantasyTeam.toLowerCase()];

                if (teamId !== undefined) {
                  const team = fantasyTeamMap.get(teamId);
                  if (team) {
                    team.playerCount++;
                    const playerPoints =
                      typeof player.points === "number" ? player.points : 0;
                    team.totalPoints += playerPoints;

                    const playerWithGameInfo = {
                      ...player,
                      gameId: game.id,
                      nhlTeam: game.awayTeam,
                      teamLogo: game.awayTeamLogo,
                    };

                    team.players.push(playerWithGameInfo);
                  }
                } else {
                  // If we don't have this team in our map yet, treat it as a standalone team
                  if (!fantasyTeamMap.has(-1)) {
                    // Create a special map entry for these players with unknown teams
                    const unknownTeam: FantasyTeamCount = {
                      teamId: -1,
                      teamName: player.fantasyTeam,
                      playerCount: 0,
                      players: [],
                      totalPoints: 0,
                    };
                    fantasyTeamMap.set(-1, unknownTeam);
                  }

                  const unknownTeam = fantasyTeamMap.get(-1)!;
                  unknownTeam.playerCount++;
                  const playerPoints =
                    typeof player.points === "number" ? player.points : 0;
                  unknownTeam.totalPoints += playerPoints;

                  const playerWithGameInfo = {
                    ...player,
                    gameId: game.id,
                    nhlTeam: game.awayTeam,
                    teamLogo: game.awayTeamLogo,
                  };

                  unknownTeam.players.push(playerWithGameInfo);
                }
              }
            });
          }
        });

        // Create a map to group players by fantasy team name (for those without ID matches)
        const teamNameGroups: Record<string, PlayerWithPoints[]> = {};

        // Handle the case where we have fantasy team names that don't match team names
        if (fantasyTeamMap.has(-1)) {
          const unknownTeam = fantasyTeamMap.get(-1)!;

          // Group players by fantasy team name
          unknownTeam.players.forEach((player) => {
            if (player.fantasyTeam) {
              if (!teamNameGroups[player.fantasyTeam]) {
                teamNameGroups[player.fantasyTeam] = [];
              }
              teamNameGroups[player.fantasyTeam].push(player);
            }
          });

          // Remove the placeholder team since we'll create proper teams
          fantasyTeamMap.delete(-1);

          // Create a team for each fantasy team name
          Object.entries(teamNameGroups).forEach(
            ([teamName, players], index) => {
              const totalPoints = players.reduce(
                (sum, player) => sum + (player.points || 0),
                0,
              );

              // Create a pseudo-ID that won't conflict with real team IDs (typically 1-100)
              const pseudoId = 10000 + index;

              fantasyTeamMap.set(pseudoId, {
                teamId: pseudoId,
                teamName: teamName,
                playerCount: players.length,
                players: players,
                totalPoints: totalPoints,
              });
            },
          );
        }

        // Sort players within each team by points (descending)
        fantasyTeamMap.forEach((team) => {
          team.players.sort((a, b) => (b.points || 0) - (a.points || 0));
        });

        // Filter teams with players
        const teamsArray = Array.from(fantasyTeamMap.values()).filter(
          (team) => team.playerCount > 0,
        );

        console.log("Fantasy teams with players:", teamsArray);

        setFantasyTeamCounts(teamsArray);
      } catch (error) {
        console.error("Error processing fantasy team data:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [gamesData, teams, nameToIdMap, teamsLoading, gamesLoading]);

  const toggleTeamExpansion = (teamId: number) => {
    if (expandAll) {
      setExpandAll(false);
    }
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
    setExpandedTeam(null); // Reset individual expansion when toggling expand all
  };

  // Sort the teams based on criteria
  const sortedTeams = [...fantasyTeamCounts].sort((a, b) => {
    if (sortBy === "teamName") {
      return a.teamName.localeCompare(b.teamName);
    } else if (sortBy === "totalPoints") {
      return b.totalPoints - a.totalPoints;
    } else {
      // Default sort by playerCount
      return b.playerCount - a.playerCount;
    }
  });

  if (teamsLoading || gamesLoading || isProcessing) {
    return <LoadingSpinner message="Processing fantasy team data..." />;
  }

  if (fantasyTeamCounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          Fantasy Teams with Players Today
        </h2>
        <div className="text-center py-4 text-gray-500">
          No fantasy teams have players in today's games.
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Games loaded: {gamesData?.games?.length || 0}</p>
          <p>Teams loaded: {teams?.length || 0}</p>
          {gamesData?.games?.length > 0 && (
            <p>
              First game has {gamesData.games[0].homeTeamPlayers?.length || 0}{" "}
              home players and {gamesData.games[0].awayTeamPlayers?.length || 0}{" "}
              away players
            </p>
          )}
          <p>
            Name to ID mapping created: {Object.keys(nameToIdMap).length}{" "}
            entries
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-bold">Fantasy Teams with Players Today</h2>

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
                  {team.teamId > 9000 ? (
                    // For dynamically created teams (those with no match in the teams data)
                    <span className="font-medium">{team.teamName}</span>
                  ) : (
                    <Link
                      to={`/teams/${team.teamId}`}
                      className="font-medium hover:text-[#6D4C9F] hover:underline"
                    >
                      {team.teamName}
                    </Link>
                  )}
                  <div className="text-sm text-gray-500">
                    {team.playerCount} player{team.playerCount !== 1 ? "s" : ""}{" "}
                    • {team.totalPoints} pts
                  </div>
                </div>
              </div>
              <div>
                <svg
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedTeam === team.teamId || expandAll ? "rotate-180" : ""}`}
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

            {/* Collapsible player details */}
            {(expandedTeam === team.teamId || expandAll) && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                  Players
                </div>
                {team.players.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {team.players.map((player, idx) => (
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
                                {player.position ? `• ${player.position}` : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          {player.points || 0} pts
                        </div>
                      </div>
                    ))}
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
