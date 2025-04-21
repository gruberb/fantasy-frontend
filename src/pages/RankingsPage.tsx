import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const RankingsPage = () => {
  // Fetch rankings with default parameters
  const {
    data: rankings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.getRankings(),
  });

  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading rankings..." />;
  }

  // Error state
  if (error || !rankings) {
    return (
      <ErrorMessage message="Failed to load rankings. Please try again." />
    );
  }

  // Prepare chart data
  const chartData = [...rankings]
    .sort((a, b) => a.rank - b.rank)
    .map((team) => ({
      name: team.team_name,
      Points: team.total_points,
      Goals: team.goals,
      Assists: team.assists,
    }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">NHL Rankings</h1>

      {/* Visualization */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Teams by Points</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Points" fill="#041E42" />
              <Bar dataKey="Goals" fill="#AF1E2D" />
              <Bar dataKey="Assists" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-left">Points</th>
              <th className="py-3 px-4 text-left">Goals</th>
              <th className="py-3 px-4 text-left">Assists</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((team) => (
              <tr key={team.team_id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-bold">{team.rank}</td>
                <td className="py-3 px-4">{team.team_name}</td>
                <td className="py-3 px-4">{team.total_points}</td>
                <td className="py-3 px-4">{team.goals}</td>
                <td className="py-3 px-4">{team.assists}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/teams/${team.team_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Team
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingsPage;
