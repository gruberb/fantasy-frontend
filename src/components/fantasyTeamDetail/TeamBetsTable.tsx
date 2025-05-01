import { NHLTeamBet } from "../../types/fantasyTeams";
import { getNHLTeamUrlSlug } from "../../utils/nhlTeams";
import { usePlayoffsData } from "../../hooks/usePlayoffsData";
import RankingTable from "../common/RankingTable";

interface TeamBetsTableProps {
  teamBets: NHLTeamBet[];
}

export default function TeamBetsTable({ teamBets }: TeamBetsTableProps) {
  if (teamBets.length === 0) {
    return null;
  }

  const { isTeamInPlayoffs } = usePlayoffsData();

  // Add a rank property to the team bets so the RankingTable can use it
  const rankedTeamBets = [...teamBets].map((bet, index) => ({
    ...bet,
    rank: index + 1,
  }));

  // Define columns for the RankingTable
  const columns = [
    {
      key: "rank",
      header: "",
    },
    {
      key: "nhlTeamName",
      header: "NHL Team",
      render: (_value: string, bet: NHLTeamBet & { rank: number }) => {
        const isInPlayoffs = isTeamInPlayoffs(bet.nhlTeam);
        return (
          <div className={!isInPlayoffs ? "opacity-25" : ""}>
            <a
              href={`https://www.nhl.com/${getNHLTeamUrlSlug(bet.nhlTeam)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-[#6D4C9F] hover:underline flex items-center font-medium"
              onClick={(e) => e.stopPropagation()}
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
          </div>
        );
      },
    },
    {
      key: "numPlayers",
      header: "Number of Players",
      className: "text-center",
      sortable: true,
      render: (value: number, bet: NHLTeamBet) => {
        const isInPlayoffs = isTeamInPlayoffs(bet.nhlTeam);
        return (
          <div className={`text-center ${!isInPlayoffs ? "opacity-25" : ""}`}>
            {value}
          </div>
        );
      },
    },
  ];

  return (
    <section className="card">
      <h2 className="text-2xl font-bold mb-4">NHL Team Bets</h2>
      <div className="overflow-x-auto">
        <RankingTable
          data={rankedTeamBets}
          columns={columns}
          keyField="nhlTeam"
          rankField="rank"
          initialSortKey="numPlayers"
          initialSortDirection="desc"
          onRowClick={null} // Disable row click navigation
          showRankColors={false} // Don't show rank colors
          className="bg-transparent shadow-none border-0"
        />
      </div>
    </section>
  );
}
