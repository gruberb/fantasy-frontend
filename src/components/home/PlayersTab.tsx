import { TopSkatersResponse } from "../../types/players";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import TopSkaters from "../players/TopSkaters";

interface PlayersTabProps {
  isLoading: boolean;
  error: unknown;
  data: TopSkatersResponse | undefined;
}

export default function PlayersTab({
  isLoading,
  error,
  data,
}: PlayersTabProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading top players..." />;
  }

  if (error) {
    return <ErrorMessage message="Could not load top players data." />;
  }

  return <TopSkaters data={data} isLoading={false} error={null} />;
}
