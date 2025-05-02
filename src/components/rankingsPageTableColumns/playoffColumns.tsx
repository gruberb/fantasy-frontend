import { Link } from "react-router-dom";
import { TeamStats } from "../../types/teamStats";

export const playoffRankingsColumns = [
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
    render: (value: string, team: TeamStats) => (
      <Link
        to={`/fantasy-teams/${team.teamId}`}
        className="font-medium text-gray-900 hover:text-[#6D4C9F]"
      >
        {value}
      </Link>
    ),
  },
  {
    key: "playersInPlayoffs",
    header: "Skaters active",
    render: (_value: any, row: any) => (
      <div className="flex items-center">
        <span className="mr-2">
          {row.playersInPlayoffs} / {row.totalPlayers}
        </span>
      </div>
    ),
  },
  {
    key: "teamsInPlayoffs",
    header: "Teams active",
    render: (_value: any, row: any) => (
      <div className="flex items-center">
        <span className="mr-2">
          {row.teamsInPlayoffs} / {row.totalTeams}
        </span>
      </div>
    ),
  },
  {
    key: "topTenPlayersCount",
    header: "Top 10 Skaters",
    render: (value: number) => (
      <div className="flex">
        <span className="font-medium">{value}</span>
      </div>
    ),
    className: "text-center",
  },
];
