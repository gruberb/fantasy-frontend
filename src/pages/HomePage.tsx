import ErrorMessage from "../components/common/ErrorMessage";
import ActionButtons from "../components/home/ActionButtons";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RankingTable from "../components/common/RankingTable";
import { useHomePageData } from "../hooks/useHomePageData";
import { getNHLTeamUrlSlug } from "../utils/nhlTeams";

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

  // Define columns for season rankings
  const seasonColumns = [
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
      className: "whitespace-nowrap",
      sortable: true,
    },
    {
      key: "assists",
      header: "Assists",
      className: "whitespace-nowrap",
      sortable: true,
    },
    {
      key: "totalPoints",
      header: "Points",
      className: "font-bold",
      sortable: true,
    },
  ];

  // Define columns for daily rankings
  const dailyColumns = [
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
      key: "dailyGoals",
      header: "Goals",
      className: "whitespace-nowrap",
      sortable: true,
    },
    {
      key: "dailyAssists",
      header: "Assists",
      className: "whitespace-nowrap",
      sortable: true,
    },
    {
      key: "dailyPoints",
      header: "Points",
      className: "font-bold whitespace-nowrap",
      sortable: true,
    },
    {
      key: "playerHighlights",
      header: "Top Skaters",
      render: (playerHighlights: any[]) => {
        if (!playerHighlights || playerHighlights.length === 0) {
          return <span className="text-gray-400">None</span>;
        }

        const player = playerHighlights[0];

        return (
          <div className="flex w-[10rem]">
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.playerName}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 bg-[#6D4C9F]/10">
                <span className="text-xs font-medium text-[#6D4C9F] whitespace-nowrap">
                  {player.playerName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              {player.nhlId ? (
                <a
                  href={`https://www.nhl.com/player/${player.nhlId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-[#6D4C9F] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{player.playerName}</span>
                </a>
              ) : (
                <div className="text-gray-900">
                  <span>{player.playerName}</span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                <span>
                  {player.nhlTeam ? (
                    <a
                      href={`https://www.nhl.com/${getNHLTeamUrlSlug(player.nhlTeam)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#6D4C9F] hover:underline"
                    >
                      {player.nhlTeam}
                    </a>
                  ) : (
                    player.nhlTeam
                  )}{" "}
                </span>
                • {player.points} pts
              </div>
            </div>
          </div>
        );
      },
    },
  ];

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
            columns={seasonColumns}
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
            columns={dailyColumns}
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

      {/* Action buttons */}
      <ActionButtons />
    </div>
  );
};

export default HomePage;
