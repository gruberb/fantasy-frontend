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
  // Sort players by position and then by name
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // First sort by position
      if (a.position !== b.position) {
        // Common position order in hockey
        const posOrder = { G: 1, D: 2, C: 3, LW: 4, RW: 5 };
        const aOrder = posOrder[a.position as keyof typeof posOrder] || 99;
        const bOrder = posOrder[b.position as keyof typeof posOrder] || 99;
        return aOrder - bOrder;
      }

      // Then by jersey number
      if (a.jersey_number !== b.jersey_number) {
        return (a.jersey_number || 0) - (b.jersey_number || 0);
      }

      // Finally by name
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
        className={`bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto ${maxHeight ? "overflow-y-auto" : ""}`}
        style={{ maxHeight }}
      >
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Player</th>
              <th className="py-2 px-4 text-left">Position</th>
              {showTeam && <th className="py-2 px-4 text-left">Team</th>}
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr key={player.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{player.jersey_number}</td>
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    {player.image_url ? (
                      <img
                        src={player.image_url}
                        alt={player.name}
                        className="w-10 h-10 object-cover rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium">
                          {player.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">{player.name}</span>
                  </div>
                </td>
                <td className="py-2 px-4">{player.position}</td>
                {showTeam && (
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      {player.team_logo ? (
                        <img
                          src={player.team_logo}
                          alt={player.nhl_team || ""}
                          className="w-6 h-6 mr-2"
                        />
                      ) : null}
                      <span>
                        {player.nhl_team || player.teamAbbreviation || ""}
                      </span>
                    </div>
                  </td>
                )}
                <td className="py-2 px-4">
                  <Link
                    to={`/teams/${player.team_id || player.fantasy_team_id}`}
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

export default PlayerList;
