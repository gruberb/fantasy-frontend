import { Ranking } from "../../types/rankings";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import RankingsTable from "./RankingsTable";

interface SeasonRankingsProps {
  isLoading: boolean;
  error: unknown;
  data: Ranking[] | undefined;
}

export default function SeasonRankings({
  isLoading,
  error,
  data,
}: SeasonRankingsProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading season rankings..." />;
  }

  if (error) {
    return (
      <ErrorMessage message="Failed to load season rankings. Please try again." />
    );
  }

  return (
    <div className="card overflow-x-auto">
      <RankingsTable rankings={data} />
    </div>
  );
}
