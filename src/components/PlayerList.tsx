import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Player } from "../api/client";

interface PlayerListProps {
  players: (Player & { teamName?: string; teamAbbreviation?: string })[];
  showTeam?: boolean;
  title?: string;
  emptyMessage?: string;
  maxHeight?: string;
}

const PlayerList = ({
  players,
  showTeam = false,
  title = "Players",
  emptyMessage = "No players available.",
  maxHeight,
}: PlayerListProps) => {
  const sortedPlayers = useMemo(() => {
    const posOrder = { G: 1, D: 2, C: 3, LW: 4, RW: 5 };
    return [...players].sort((a, b) => {
      const aOrder = posOrder[a.position as keyof typeof posOrder] || 99;
      const bOrder = posOrder[b.position as keyof typeof posOrder] || 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.jerseyNumber !== b.jerseyNumber) {
        return (a.jerseyNumber || 0) - (b.jerseyNumber || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [players]);

  if (sortedPlayers.length === 0) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div>
      {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
      <div
        className={`bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100 ${maxHeight ? "overflow-y-auto" : ""}`}
        style={{ maxHeight }}
      >
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              {showTeam && (
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
              )}
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap">
                  {player.jerseyNumber}
                </td>
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
                      <div className="text-sm font-medium text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {player.position}
                      </div>
                    </div>
                  </div>
                </td>
                {showTeam && (
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {player.teamLogo && (
                        <img
                          src={player.teamLogo}
                          alt={player.nhlTeam || ""}
                          className="h-6 w-6 mr-2"
                        />
                      )}
                      <span>
                        {player.nhlTeam || player.teamAbbreviation || ""}
                      </span>
                    </div>
                  </td>
                )}
                <td className="py-3 px-4 whitespace-nowrap">
                  <Link
                    to={`/teams/${player.teamId || player.fantasyTeam}`}
                    className="text-[#6D4C9F] hover:text-[#5A3A87] hover:underline font-medium"
                  >
                    View Team →
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

export default PlayerList;
