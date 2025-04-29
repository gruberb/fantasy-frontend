import { SkaterWithTeam } from "../../types/skaters";

interface PlayerTeamSectionProps {
  teamName: string;
  players: SkaterWithTeam[];
  playersInPlayoffs: number;
  isTeamInPlayoffs: (team: string) => boolean;
}

export default function PlayerTeamSection({
  teamName,
  players,
  playersInPlayoffs,
  isTeamInPlayoffs,
}: PlayerTeamSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">{teamName}</h2>
        <span className="ml-2 text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
          {players.length} players ({playersInPlayoffs} still in Playoffs)
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NHL Team
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Goals
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Assists
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {players.map((player, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${!isTeamInPlayoffs(player.nhlTeam || "") ? "opacity-60" : ""}`}
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  <a
                    href={`https://www.nhl.com/player/${player.nhlId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center group"
                  >
                    <div className="flex-shrink-0 h-10 w-10">
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
                    </div>

                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {player.position}
                      </div>
                    </div>
                  </a>
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
                      <span className="text-sm hidden sm:table-cell text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline">
                        {player.nhlTeam}
                      </span>
                    </div>
                  </a>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {player.totalPoints}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-900">{player.goals}</div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-900">{player.assists}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
