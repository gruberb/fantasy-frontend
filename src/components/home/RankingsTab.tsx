import RankingsTable from "../rankings/RankingsTable";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import { Ranking } from "../../types/rankings";

interface RankingsTabProps {
  isLoading: boolean;
  error: unknown;
  rankings: Ranking[] | undefined;
}

export default function RankingsTab({
  isLoading,
  error,
  rankings,
}: RankingsTabProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading rankings..." />;
  }

  if (error) {
    return <ErrorMessage message="Could not load rankings data." />;
  }

  return <RankingsTable rankings={rankings} />;
}
