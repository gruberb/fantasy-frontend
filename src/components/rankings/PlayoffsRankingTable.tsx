import { useNavigate } from "react-router-dom";
import React from "react";

interface PlayoffTeamRanking {
  teamId: number;
  teamName: string;
  teamsInPlayoffs: number;
  totalTeams: number;
  playersInPlayoffs: number;
  totalPlayers: number;
  playoffScore: number;
  rank?: number;
  goals?: number;
  assists?: number;
  totalPoints?: number;
}

interface PlayoffRankingsTableProps {
  playoffRankings: PlayoffTeamRanking[];
  title?: string;
}

const PlayoffRankingsTable: React.FC<PlayoffRankingsTableProps> = ({
  playoffRankings = [],
  title = "Playoff Rankings",
}) => {
  const navigate = useNavigate();

  // Check if we have data
  if (!playoffRankings || playoffRankings.length === 0) {
    return (
      <div>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
          <p className="text-gray-500">No playoff rankings data available.</p>
        </div>
      </div>
    );
  }

  // Helper to get rank color
  const getRankColor = (rank: number): string => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-white";
  };

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                Team
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                Teams in Playoffs
              </th>
              <th className="py-3 px-4 text-left hidden md:table-cell text-sm font-semibold text-gray-700">
                Players in Playoffs
              </th>
            </tr>
          </thead>
          <tbody>
            {playoffRankings.map((team, index) => (
              <tr
                key={team.teamId}
                className="border-b border-gray-50 transition-colors duration-150 hover:bg-[#f8f7ff] cursor-pointer"
                onClick={() => navigate(`/teams/${team.teamId}`)}
              >
                <td className="py-3 px-4">
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(index + 1)}`}
                  >
                    {index + 1}
                  </div>
                </td>
                <td className="py-3 px-4 font-medium">{team.teamName}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{team.totalTeams}</span>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {team.teamsInPlayoffs}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{team.totalPlayers}</span>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {team.playersInPlayoffs}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayoffRankingsTable;
