import ErrorMessage from "../components/common/ErrorMessage";
import ActionButtons from "../components/home/ActionButtons";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RankingTable from "../components/common/RankingTable";
import { useHomePageData } from "../hooks/useHomePageData";
import { getNHLTeamUrlSlug } from "../utils/nhlTeams";
import { sleepersRankingsColumns } from "../components/rankingsPageTableColumns/sleepersColumns";
import { useRankingsData } from "../hooks/useRankingsData";
import { seasonRankingsColumns } from "../components/rankingsPageTableColumns/seasonColumns";
import { dailyRankingsColumns } from "../components/rankingsPageTableColumns/dailysColumns";

const HomePage = () => {
  const {
    yesterdayDate,
    rankings,
    rankingsLoading,
    rankingsError,
    yesterdayRankings,
    yesterdayRankingsLoading,
    yesterdayRankingsError,
  } = useHomePageData();

  const { sleepersData, sleepersLoading, sleepersError } = useRankingsData();

  // Extract rankings from API response if needed
  let dailyRankingsData = [];
  if (yesterdayRankings) {
    if (Array.isArray(yesterdayRankings)) {
      dailyRankingsData = yesterdayRankings;
    } else if (
      typeof yesterdayRankings === "object" &&
      "rankings" in yesterdayRankings
    ) {
      dailyRankingsData = yesterdayRankings.rankings;
    } else if (
      typeof yesterdayRankings === "object" &&
      "data" in yesterdayRankings &&
      yesterdayRankings.data &&
      typeof yesterdayRankings.data === "object" &&
      "rankings" in yesterdayRankings.data
    ) {
      dailyRankingsData = yesterdayRankings.data.rankings;
    }
  }

  return (
    <div>
      {/* Overall Rankings */}
      <div className="mb-6">
        {rankingsLoading ? (
          <LoadingSpinner message="Loading overall rankings..." />
        ) : rankingsError ? (
          <ErrorMessage message="Could not load overall rankings." />
        ) : (
          <RankingTable
            columns={seasonRankingsColumns}
            data={Array.isArray(rankings) ? rankings : []}
            keyField="teamId"
            rankField="rank"
            title="Overall Rankings"
            limit={7}
            dateBadge="2024/2025 Playoffs"
            viewAllLink="/rankings"
            initialSortKey="totalPoints"
            initialSortDirection="desc"
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
          <RankingTable
            columns={dailyRankingsColumns}
            data={dailyRankingsData}
            keyField="teamId"
            rankField="rank"
            title="Yesterday's Rankings"
            limit={7}
            dateBadge={yesterdayDate}
            initialSortKey="dailyPoints"
            initialSortDirection="desc"
            emptyMessage="No rankings data available for yesterday."
          />
        )}
      </div>

      <div className="mt-8">
        <RankingTable
          columns={sleepersRankingsColumns}
          data={sleepersData}
          keyField="id"
          rankField="rank"
          title="Sleepers"
          dateBadge="2024/2025 Playoffs"
          isLoading={sleepersLoading}
          emptyMessage={
            sleepersError
              ? "Failed to load sleeper players"
              : "No sleeper players available"
          }
          initialSortKey="totalPoints"
          initialSortDirection="desc"
          showRankColors={false}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-8">
        <ActionButtons />
      </div>
    </div>
  );
};

export default HomePage;
