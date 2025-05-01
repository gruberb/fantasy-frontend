import { PlayoffFantasyTeamRanking } from "../../types/rankings";
import RankingTable from "../common/RankingTable";

interface PlayoffRankingsTableProps {
  playoffRankings: PlayoffFantasyTeamRanking[];
  title?: string;
  limit?: number;
}

const PlayoffRankingsTable: React.FC<PlayoffRankingsTableProps> = ({
  playoffRankings = [],
  title = "Playoff Stats",
  limit,
}) => {
  // Define columns for the playoff rankings
  const columns = [
    {
      key: "rank",
      header: "Rank",
      // Use index as rank
      render: (_value: any, _row: any, index: number) => index + 1,
    },
    {
      key: "teamName",
      header: "Team",
      className: "font-medium",
      sortable: true,
    },
    {
      key: "playersInPlayoffs",
      header: "Players in Playoffs",
      render: (_value: any, row: PlayoffFantasyTeamRanking) => (
        <div className="flex items-center">
          <span className="font-bold mr-2">
            {row.playersInPlayoffs} / {row.totalPlayers}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "teamsInPlayoffs",
      header: "Teams in Playoffs",
      render: (_value: any, row: PlayoffFantasyTeamRanking) => (
        <div className="flex items-center">
          <span className="font-bold mr-2">
            {row.teamsInPlayoffs} / {row.totalTeams}
          </span>
        </div>
      ),
      responsive: "md" as const,
      sortable: true,
    },
  ];

  return (
    <RankingTable
      columns={columns}
      data={playoffRankings}
      keyField="teamId"
      rankField="rank"
      title={title}
      limit={limit}
      emptyMessage="No playoff rankings data available."
      initialSortKey="playersInPlayoffs"
      initialSortDirection="desc"
    />
  );
};

export default PlayoffRankingsTable;
