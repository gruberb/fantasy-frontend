import { RankingItem } from "../../types/rankings";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import DailyRankingsCard from "../rankings/DailyRankingsCard";

interface DailyRankingsProps {
  isLoading: boolean;
  error: unknown;
  data: RankingItem[] | undefined;
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
      <div className="card">No daily rankings available for this date.</div>
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
