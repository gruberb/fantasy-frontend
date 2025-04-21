import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Player } from "../api/client";

interface PositionBreakdownProps {
  players: Player[];
}

const PositionBreakdown = ({ players }: PositionBreakdownProps) => {
  // Position breakdown data
  const positionCounts = players.reduce(
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

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={positionData}>
          <XAxis dataKey="position" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Number of Players" fill="#041E42" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PositionBreakdown;
