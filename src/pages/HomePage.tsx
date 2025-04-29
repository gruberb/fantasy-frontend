import ErrorMessage from "../components/common/ErrorMessage";
import DailyRankingsCard from "../components/rankings/DailyRankingsCard";
import RankingsTab from "../components/home/RankingsTab";
import TopSkaters from "../components/players/TopSkaters";
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
      {/* Header - first row */}
      <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Fantasy NHL Dashboard</h1>
      </div>

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

      {/* Top Players Section */}
      <div className="mb-6">
        {topSkatersLoading ? (
          <LoadingSpinner message="Loading Top Players rankings..." />
        ) : topSkatersError ? (
          <ErrorMessage message="Could not load Top Players rankings." />
        ) : (
          <TopSkaters
            data={topSkatersData}
            isLoading={topSkatersLoading}
            error={topSkatersError}
          />
        )}
      </div>

      {/* Action buttons */}
      <ActionButtons />
    </div>
  );
};

export default HomePage;
