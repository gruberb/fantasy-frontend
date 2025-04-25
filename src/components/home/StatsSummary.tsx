import { GamesResponse } from "../../types/games";
import { usePlayoffsData } from "../../hooks/usePlayoffsData";
import { getTeamLogoUrl, getNHLTeamUrlSlug } from "../../utils/nhlTeams";

interface StatsSummaryProps {
  gamesData: GamesResponse | undefined;
  isLoading: boolean;
}

export default function StatsSummary({
  gamesData,
  isLoading,
}: StatsSummaryProps) {
  const { teamsInPlayoffs, isLoading: playoffsLoading } = usePlayoffsData();

  // Extract summary stats
  const gamesSummary = gamesData?.summary || {
    totalGames: 0,
    totalTeamsPlaying: 0,
    teamPlayersCount: [],
  };

  // Get most represented team
  const mostPlayersTeam =
    gamesSummary.teamPlayersCount.length > 0
      ? gamesSummary.teamPlayersCount[0].nhlTeam
      : "N/A";

  // Get player count for that team
  const mostPlayersCount =
    gamesSummary.teamPlayersCount.length > 0
      ? gamesSummary.teamPlayersCount[0].playerCount
      : 0;

  return (
    <div className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-3xl font-bold mb-2">Fantasy NHL Dashboard</h1>
      <p className="text-lg opacity-90 mb-6">Today's Games overview:</p>

      {/* First row - standard stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-80">Team with most bets</div>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
            ) : (
              mostPlayersTeam
            )}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-80">
            Fantasy Teams with Players for today
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
            ) : (
              mostPlayersCount
            )}
          </div>
        </div>
      </div>

      {/* Second row - playoff teams */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm opacity-80 mb-3">Active Playoffs Teams</div>
        <div className="flex flex-wrap gap-3">
          {playoffsLoading ? (
            <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
          ) : (
            Array.from(teamsInPlayoffs).map((teamAbbrev) => {
              const teamLogo = getTeamLogoUrl(teamAbbrev);
              const url_slug = getNHLTeamUrlSlug(teamAbbrev);
              return (
                <div
                  key={teamAbbrev}
                  className="bg-white/20 rounded-lg p-2 flex items-center justify-center"
                  title={teamAbbrev}
                >
                  <a
                    href={`https://www.nhl.com/${url_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center group"
                  >
                    {teamLogo ? (
                      <img
                        src={teamLogo}
                        alt={teamAbbrev}
                        className="w-12 h-12 object-contain mb-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-1">
                        <span className="text-sm font-bold text-white">
                          {teamAbbrev}
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-white">
                      {teamAbbrev}
                    </span>
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
