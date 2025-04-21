import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface TeamStatsProps {
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
}

const TeamStats = ({ wins, losses, otLosses, points }: TeamStatsProps) => {
  // Create chart data for wins/losses/ot
  const recordData = [
    { name: "Wins", value: wins, color: "#4CAF50" },
    { name: "Losses", value: losses, color: "#F44336" },
    { name: "OT Losses", value: otLosses, color: "#FFC107" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="font-medium">Points</span>
        <span className="font-bold text-xl">{points}</span>
      </div>

      <div className="flex items-center justify-between border-b pb-2">
        <span className="font-medium">Record</span>
        <span>
          {wins}W - {losses}L - {otLosses}OTL
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={recordData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {recordData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamStats;
