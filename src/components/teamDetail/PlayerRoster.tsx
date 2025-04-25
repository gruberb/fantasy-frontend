import { PlayerStats } from "../../types/players";

interface PlayerRosterProps {
  players: PlayerStats[];
}

export default function PlayerRoster({ players }: PlayerRosterProps) {
  const sortedPlayers = [...players].sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  return (
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
                        <a
                          href={`https://www.nhl.com/player/${player.nhlId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-[#6D4C9F] hover:underline flex items-center font-medium"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {player.name}
                          </div>
                        </a>
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
  );
}
