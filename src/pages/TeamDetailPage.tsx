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
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const TeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const id = parseInt(teamId || "0", 10);

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

  if (teamsLoading || pointsLoading || betsLoading) {
    return <LoadingSpinner size="large" message="Loading team data..." />;
  }

  const team = teams?.find((t) => t.id === id);

  if (!team || !teamPoints) {
    return <ErrorMessage message="Team not found or data unavailable" />;
  }

  const currentTeamBets = teamBets?.find((tb) => tb.team_id === id)?.bets || [];
  currentTeamBets.sort((a, b) => b.num_players - a.num_players);

  const positionCounts = teamPoints.players.reduce(
    (acc: Record<string, number>, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    },
    {},
  );

  const players = teamPoints.players.sort(
    (a, b) => b.total_points - a.total_points,
  );
  const positionData = Object.entries(positionCounts).map(
    ([position, count]) => ({ position, count }),
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link to="/teams" className="btn btn-secondary">
          ← Back to Teams
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        {team.team_logo ? (
          <img
            src={team.team_logo}
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
            Total Points: {teamPoints.team_totals.total_points}
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
                {teamPoints.team_totals.goals}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Assists</span>
              <span className="font-bold text-xl">
                {teamPoints.team_totals.assists}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Total Points</span>
              <span className="font-bold text-xl">
                {teamPoints.team_totals.total_points}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">Goals</div>
                <div className="text-3xl font-bold">
                  {teamPoints.team_totals.goals}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">Assists</div>
                <div className="text-3xl font-bold">
                  {teamPoints.team_totals.assists}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Players by Position (Bar Chart) */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">Players by Position</h2>
          {positionData.length > 0 ? (
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positionData}>
                  <XAxis dataKey="position" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Number of Players"
                    fill="#041E42"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">No position data available.</p>
          )}
        </section>

        {/* Player Roster */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">Player Roster</h2>
          {players.length > 0 ? (
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
                  {players.map((player, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {player.image_url ? (
                            <img
                              src={player.image_url}
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
                            {player.team_logo ? (
                              <img
                                src={player.team_logo}
                                alt={`${player.nhl_team} logo`}
                                className="h-6 w-6 mr-2"
                              />
                            ) : null}
                            <span className="text-sm text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                              {player.nhl_team}
                            </span>
                          </div>
                        </a>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm h-7 font-semibold text-gray-900">
                          {player.total_points}
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

        {currentTeamBets.length > 0 && (
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
                  {currentTeamBets.map((bet, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center">
                          {bet.team_logo ? (
                            <img
                              src={bet.team_logo}
                              alt={`${bet.nhl_team} logo`}
                              className="h-6 w-6 mr-2"
                            />
                          ) : null}
                          <span>{bet.nhl_team_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {bet.num_players}
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
