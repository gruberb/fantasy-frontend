import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "../api/client";
import { usePlayoffsData } from "../hooks/usePlayoffsData";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const TeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const id = parseInt(teamId || "0", 10);

  // ALWAYS call all hooks at the top level, unconditionally
  const { isTeamInPlayoffs, isLoading: playoffsLoading } = usePlayoffsData();

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: api.getTeams,
  });

  const { data: teamPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ["teamPoints", id],
    queryFn: () => api.getTeamPoints(id),
    enabled: !!id,
  });

  const { data: teamBets, isLoading: betsLoading } = useQuery({
    queryKey: ["teamBets"],
    queryFn: api.getTeamBets,
  });

  // Calculate playoff-related data using useMemo
  // This way the calculations only happen when dependencies change, not on every render
  const playoffStats = useMemo(() => {
    // Default values when data isn't loaded yet
    const defaultStats = {
      teamsInPlayoffsCount: 0,
      teamsInPlayoffs: [],
      sortedPlayersInPlayoffsCount: 0,
      sortedPlayersInPlayoffs: [],
    };

    // Only calculate if all dependencies are available
    if (!teamPoints || !teamBets || playoffsLoading || !isTeamInPlayoffs) {
      return defaultStats;
    }

    // Find the team's bets
    const currentTeamBets = teamBets.find((tb) => tb.teamId === id)?.bets || [];

    // Check if players array exists before accessing it
    const players = teamPoints?.players || [];

    // Filter for teams and players in playoffs
    const teamsInPlayoffs = currentTeamBets.filter((bet) =>
      isTeamInPlayoffs(bet.nhlTeam),
    );

    const playersInPlayoffs = players.filter((player) =>
      isTeamInPlayoffs(player.nhlTeam || ""),
    );

    const sortedPlayersInPlayoffs = [...playersInPlayoffs].sort(
      (a, b) => b.totalPoints - a.totalPoints,
    );

    return {
      teamsInPlayoffsCount: teamsInPlayoffs.length,
      teamsInPlayoffs,
      sortedPlayersInPlayoffsCount: playersInPlayoffs.length,
      sortedPlayersInPlayoffs,
    };
  }, [id, teamPoints, teamBets, playoffsLoading, isTeamInPlayoffs]);

  // Early return for loading state
  if (teamsLoading || pointsLoading || betsLoading || playoffsLoading) {
    return <LoadingSpinner size="large" message="Loading team data..." />;
  }

  // Error handling after all hooks are called
  const team = teams?.find((t) => t.id === id);
  if (!team || !teamPoints) {
    return <ErrorMessage message="Team not found or data unavailable" />;
  }

  // Safe access to data
  const currentTeamBets = teamBets?.find((tb) => tb.teamId === id)?.bets || [];
  const sortedTeamBets = [...currentTeamBets].sort(
    (a, b) => b.numPlayers - a.numPlayers,
  );
  const players = teamPoints?.players || [];
  const sortedPlayers = [...players].sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link to="/teams" className="btn btn-secondary">
          ← Back to Teams
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        {team.teamLogo ? (
          <img
            src={team.teamLogo}
            alt={`${team.name} logo`}
            className="w-24 h-24 object-contain"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-full">
            <span className="text-3xl font-bold text-gray-500">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-xl text-gray-600">Fantasy Team</p>
          <p className="text-lg text-gray-500">
            Total Points: {teamPoints.teamTotals.totalPoints}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Stats */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">Team Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Goals</span>
              <span className="font-bold text-xl">
                {teamPoints.teamTotals.goals}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Assists</span>
              <span className="font-bold text-xl">
                {teamPoints.teamTotals.assists}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Total Points</span>
              <span className="font-bold text-xl">
                {teamPoints.teamTotals.totalPoints}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">Goals</div>
                <div className="text-3xl font-bold">
                  {teamPoints.teamTotals.goals}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">Assists</div>
                <div className="text-3xl font-bold">
                  {teamPoints.teamTotals.assists}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Playoff Stats Section */}
        <section className="card mt-8">
          <h2 className="text-2xl font-bold mb-4">Playoff Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">
                NHL Teams in Playoffs
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Teams in Playoffs:</span>
                  <span className="font-bold">
                    {playoffStats.teamsInPlayoffsCount} /{" "}
                    {currentTeamBets.length}
                  </span>
                </div>

                {playoffStats.teamsInPlayoffs.length > 0 ? (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">
                      Teams Still Active:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {playoffStats.teamsInPlayoffs.map((team) => (
                        <div
                          key={team.nhlTeam}
                          className="flex items-center bg-gray-50 text-gray-800 px-3 py-1 rounded border border-gray-200"
                        >
                          {team.teamLogo && (
                            <img
                              src={team.teamLogo}
                              alt={team.nhlTeam}
                              className="w-5 h-5 mr-2"
                            />
                          )}
                          <span className="text-sm font-medium">
                            {team.nhlTeamName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">
                    No teams in playoffs
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Playoffs Stats</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Players in Playoffs</span>
                  <span className="font-bold">
                    {playoffStats.sortedPlayersInPlayoffsCount} /{" "}
                    {players.length}
                  </span>
                </div>

                {playoffStats.sortedPlayersInPlayoffsCount > 0 ? (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Top 5 Players</h4>
                    <div className="flex flex-col gap-2">
                      {playoffStats.sortedPlayersInPlayoffs
                        .slice(0, 5)
                        .map((player) => (
                          <div key={player.name} className="flex items-center">
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-medium">
                                  {player.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-sm">{player.name}</span>
                            <span className="ml-auto text-sm font-bold">
                              {player.totalPoints} pts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">
                    No players in playoffs
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Player Roster */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">Player Roster</h2>
          {sortedPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NHL Team
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goals
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assists
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedPlayers.map((player, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {player.imageUrl ? (
                            <img
                              src={player.imageUrl}
                              alt={player.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#6D4C9F]/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-[#6D4C9F]">
                                {player.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <a
                          href={`https://www.nhl.com/${player.nhlTeamUrlSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center group"
                        >
                          <div className="flex items-center">
                            {player.teamLogo ? (
                              <img
                                src={player.teamLogo}
                                alt={`${player.nhlTeam} logo`}
                                className="h-6 w-6 mr-2"
                              />
                            ) : null}
                            <span className="text-sm text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                              {player.nhlTeam}
                            </span>
                          </div>
                        </a>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm h-7 font-semibold text-gray-900">
                          {player.totalPoints}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm h-7 text-gray-900">
                          {player.goals}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm h-7 text-gray-900">
                          {player.assists}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No players available for this team.</p>
          )}
        </section>

        {sortedTeamBets.length > 0 && (
          <section className="card">
            <h2 className="text-2xl font-bold mb-4">NHL Team Bets</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NHL Team
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number of Players
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedTeamBets.map((bet, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center">
                          {bet.teamLogo ? (
                            <img
                              src={bet.teamLogo}
                              alt={`${bet.nhlTeam} logo`}
                              className="h-6 w-6 mr-2"
                            />
                          ) : null}
                          <span>{bet.nhlTeamName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {bet.numPlayers}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
