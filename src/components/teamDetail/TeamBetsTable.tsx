import { TeamBet } from "../../types/teams";
import { getNHLTeamUrlSlug } from "../../utils/nhlTeams";

interface TeamBetsTableProps {
  teamBets: TeamBet[];
}

export default function TeamBetsTable({ teamBets }: TeamBetsTableProps) {
  if (teamBets.length === 0) {
    return null;
  }

  const sortedTeamBets = [...teamBets].sort(
    (a, b) => b.numPlayers - a.numPlayers,
  );

  return (
    <section className="card">
      <h2 className="text-2xl font-bold mb-4">NHL Team Bets</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NHL Team
              </th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number of Players
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedTeamBets.map((bet, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <a
                    href={`https://www.nhl.com/${getNHLTeamUrlSlug(bet.nhlTeam)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-[#6D4C9F] hover:underline flex items-center font-medium"
                  >
                    <div className="flex items-center">
                      {bet.teamLogo ? (
                        <img
                          src={bet.teamLogo}
                          alt={`${bet.nhlTeam} logo`}
                          className="h-6 w-6 mr-2"
                        />
                      ) : null}
                      <span>{bet.nhlTeamName}</span>
                    </div>
                  </a>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  {bet.numPlayers}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
