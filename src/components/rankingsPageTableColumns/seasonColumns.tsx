import { Link } from "react-router-dom";

import { TeamStats } from "../../types/teamStats";

export const seasonRankingsColumns = [
  {
    key: "rank",
    header: "Rank",
    sortable: true,
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
    key: "goals",
    header: "Goals",
    sortable: true,
  },
  {
    key: "assists",
    header: "Assists",
    sortable: true,
  },
  {
    key: "totalPoints",
    header: "Points",
    className: "font-bold",
    sortable: true,
  },
];
