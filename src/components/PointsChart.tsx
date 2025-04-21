import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Ranking } from "../api/client";

interface PointsChartProps {
  rankings: Ranking[] | undefined | null;
  limit?: number;
}

const PointsChart = ({ rankings = [], limit = 10 }: PointsChartProps) => {
  // Check if rankings is a valid array
  if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No ranking data available for chart.</p>
      </div>
    );
  }

  // Sort and limit rankings
  const topTeams = [...rankings]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, limit)
    .map((team) => ({
      name: team.team_name,
      goals: team.goals,
      assists: team.assists,
      points: team.total_points,
    }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={topTeams}
          margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#041E42"
            activeDot={{ r: 8 }}
            name="Total Points"
          />
          <Line type="monotone" dataKey="goals" stroke="#AF1E2D" name="Goals" />
          <Line
            type="monotone"
            dataKey="assists"
            stroke="#4CAF50"
            name="Assists"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PointsChart;
