import ErrorMessage from "../components/common/ErrorMessage";
import DailyRankingsCard from "../components/rankings/DailyRankingsCard";
import RankingsTab from "../components/home/RankingsTab";
import TopSkaters from "../components/skaters/TopSkaters";
import ActionButtons from "../components/home/ActionButtons";
import LoadingSpinner from "../components/common/LoadingSpinner";

import { useHomePageData } from "../hooks/useHomePageData";

const HomePage = () => {
  const {
    yesterdayDate,
    rankings,
    rankingsLoading,
    rankingsError,
    topSkatersData,
    topSkatersLoading,
    topSkatersError,
    yesterdayRankings,
    yesterdayRankingsLoading,
    yesterdayRankingsError,
  } = useHomePageData();

  return (
    <div>
      {/* Overall Rankings */}
      <div className="mb-6">
        {rankingsLoading ? (
          <LoadingSpinner message="Loading overall rankings..." />
        ) : rankingsError ? (
          <ErrorMessage message="Could not load overall rankings." />
        ) : (
          <RankingsTab
            isLoading={rankingsLoading}
            error={rankingsError}
            rankings={rankings}
          />
        )}
      </div>

      {/* Yesterday's Rankings Section */}
      <div className="mb-6">
        {yesterdayRankingsLoading ? (
          <LoadingSpinner message="Loading yesterday's rankings..." />
        ) : yesterdayRankingsError ? (
          <ErrorMessage message="Could not load yesterday's rankings." />
        ) : (
          <DailyRankingsCard
            rankings={yesterdayRankings || []}
            date={yesterdayDate}
            title="Yesterday's Rankings"
            limit={7}
          />
        )}
      </div>

      {/* Action buttons */}
      <ActionButtons />
    </div>
  );
};

export default HomePage;
