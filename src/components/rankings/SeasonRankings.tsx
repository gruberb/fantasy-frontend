import { Ranking } from "../../types/rankings";
import RankingTable from "../common/RankingTable";

interface SeasonRankingsProps {
  isLoading: boolean;
  error: unknown;
  data: Ranking[] | undefined;
  title?: string;
  limit?: number;
}

export default function SeasonRankings({
  isLoading,
  error,
  data,
  title = "Overall Rankings",
  limit,
}: SeasonRankingsProps) {
  // Define columns for the rankings
  const columns = [
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
    },
    {
      key: "goals",
      header: "Goals",
      responsive: "md" as const,
      sortable: true,
    },
    {
      key: "assists",
      header: "Assists",
      responsive: "md" as const,
      sortable: true,
    },
    {
      key: "totalPoints",
      header: "Points",
      className: "font-bold",
      sortable: true,
    },
  ];

  // The error will be handled by the RankingTable's empty state
  const errorMessage = error ? "Failed to load season rankings." : undefined;

  return (
    <RankingTable
      columns={columns}
      data={data || []}
      keyField="teamId"
      rankField="rank"
      title={title}
      limit={limit}
      viewAllLink="/rankings"
      isLoading={isLoading}
      emptyMessage={errorMessage || "No rankings data available."}
      initialSortKey="totalPoints"
      initialSortDirection="desc"
    />
  );
}
