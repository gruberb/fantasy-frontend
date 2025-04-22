import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
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
  // Get team ID from URL
  const { teamId } = useParams<{ teamId: string }>();
  const id = parseInt(teamId || "0", 10);

  // Fetch team data
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

  // Loading state
  if (teamsLoading || pointsLoading || betsLoading) {
    return <LoadingSpinner size="large" message="Loading team data..." />;
  }

  // Get current team
  const team = teams?.find((t) => t.id === id);

  if (!team || !teamPoints) {
    return <ErrorMessage message="Team not found or data unavailable" />;
  }

  // Find this team's bets
  const currentTeamBets = teamBets?.find((tb) => tb.team_id === id)?.bets || [];

  // Create chart data for points breakdown
  const pointsData = [
    { name: "Goals", value: teamPoints.team_totals.goals, color: "#4CAF50" },
    {
      name: "Assists",
      value: teamPoints.team_totals.assists,
      color: "#F44336",
    },
  ];

  // Position breakdown data
  const positionCounts = teamPoints.players.reduce(
    (acc: Record<string, number>, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    },
    {},
  );

  const positionData = Object.entries(positionCounts).map(
    ([position, count]) => ({
      position,
      count,
    }),
  );

  // Distribution of players by NHL team
  const nhlTeamCounts = teamPoints.players.reduce(
    (acc: Record<string, number>, player) => {
      acc[player.nhl_team] = (acc[player.nhl_team] || 0) + 1;
      return acc;
    },
    {},
  );

  const nhlTeamData = Object.entries(nhlTeamCounts)
    .map(([team, count]) => ({ team, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="mb-4">
        <Link to="/teams" className="text-blue-600 hover:underline">
          ← Back to Teams
        </Link>
      </div>

      {/* Team Header */}
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
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Goals</span>
              <span className="font-bold text-xl">
                {teamPoints.team_totals.goals}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Assists</span>
              <span className="font-bold text-xl">
                {teamPoints.team_totals.assists}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Total Points</span>
              <span className="font-bold text-xl">
                {teamPoints.team_totals.total_points}
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pointsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pointsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Team Players */}
        <section className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Players by Position</h2>
          </div>

          {positionData.length > 0 ? (
            <div>
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
            </div>
          ) : (
            <p className="text-gray-500">No position data available.</p>
          )}
        </section>

        {/* Player List */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">Player Roster</h2>

          {teamPoints.players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Player</th>
                    <th className="py-2 px-4 text-left">Position</th>
                    <th className="py-2 px-4 text-left">NHL Team</th>
                    <th className="py-2 px-4 text-left">Goals</th>
                    <th className="py-2 px-4 text-left">Assists</th>
                    <th className="py-2 px-4 text-left">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPoints.players.map((player, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          {player.image_url ? (
                            <img
                              src={player.image_url}
                              alt={player.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium">
                                {player.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{player.position}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          {player.team_logo ? (
                            <img
                              src={player.team_logo}
                              alt={`${player.nhl_team} logo`}
                              className="w-6 h-6 mr-2"
                            />
                          ) : null}
                          <span>{player.nhl_team}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{player.goals}</td>
                      <td className="py-2 px-4">{player.assists}</td>
                      <td className="py-2 px-4">{player.total_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No players available for this team.</p>
          )}
        </section>

        {/* NHL Team Distribution */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">NHL Team Distribution</h2>

          {nhlTeamData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nhlTeamData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="team" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Players" fill="#AF1E2D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">
              No NHL team distribution data available.
            </p>
          )}
        </section>

        {/* Team Bets */}
        {currentTeamBets.length > 0 && (
          <section className="card lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">NHL Team Bets</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">NHL Team</th>
                    <th className="py-2 px-4 text-left">Number of Players</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTeamBets.map((bet, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          {bet.team_logo ? (
                            <img
                              src={bet.team_logo}
                              alt={`${bet.nhl_team} logo`}
                              className="w-6 h-6 mr-2"
                            />
                          ) : null}
                          <span>{bet.nhl_team}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{bet.num_players}</td>
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
