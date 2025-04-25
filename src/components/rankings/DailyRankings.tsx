import { DailyFantasyRanking } from "../../types/rankings";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import DailyRankingsCard from "../rankings/DailyRankingsCard";

interface DailyRankingsProps {
  isLoading: boolean;
  error: unknown;
  data: DailyFantasyRanking[] | undefined;
  displayDate: Date;
}

export default function DailyRankings({
  isLoading,
  error,
  data,
  displayDate,
}: DailyRankingsProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading daily rankings..." />;
  }

  if (error) {
    return (
      <div className="card">
        <ErrorMessage message="Failed to load daily rankings. Please try again." />
      </div>
    );
  }

  return (
    <DailyRankingsCard
      rankings={data || []}
      date={displayDate}
      title="Daily Fantasy Scores"
      limit={100}
    />
  );
}
