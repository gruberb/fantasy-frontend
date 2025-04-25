import React from "react";
import { TopSkatersResponse, TopSkater } from "../../types/players";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import { Link } from "react-router-dom";
import { getNHLTeamUrlSlug } from "../../utils/nhlTeams";

interface TopSkatersProps {
  data: TopSkatersResponse | undefined;
  isLoading: boolean;
  error: unknown;
}

const TopSkaters: React.FC<TopSkatersProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading top skaters..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load top skaters data." />;
  }

  // Limit to 10 entries for each category
  const topGoalScorers = data?.goals?.slice(0, 10) || [];
  const topAssistLeaders = data?.assists?.slice(0, 10) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top 10 Goal Scorers */}
      <div>
        <h3 className="text-xl font-bold mb-2">Top 10 Scorers</h3>
        {topGoalScorers.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fantasy Team
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Goals
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {topGoalScorers.map((player: TopSkater) => (
                  <tr
                    key={`goal-${player.id}`}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center group">
                        <div className="flex-shrink-0 h-6 w-6">
                          <img
                            src={player.headshot}
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                        <div className="ml-2">
                          <a
                            href={`https://www.nhl.com/player/${player.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-[#6D4C9F] hover:underline font-medium group-hover:underline"
                          >
                            {player.lastName}
                          </a>
                        </div>
                        <svg
                          className="w-3 h-3 ml-1 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={`https://www.nhl.com/${getNHLTeamUrlSlug(player.teamAbbrev)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center group"
                      >
                        <div className="flex items-center">
                          <img
                            src={player.teamLogo}
                            alt={player.teamAbbrev}
                            className="h-5 w-5 rounded mr-2"
                          />
                          <span className="text-sm text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline hidden sm:table-cell">
                            {player.teamAbbrev}
                          </span>
                          <span>
                            <svg
                              className="w-3 h-3 ml-1 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>{" "}
                          </span>
                        </div>
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {player.fantasyTeam ? (
                        <Link
                          to={`/teams/${player.fantasyTeam.teamId}`}
                          className="inline-flex items-center hover:underline text-[#6D4C9F] font-medium"
                        >
                          <span>{player.fantasyTeam.teamName}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">
                      {player.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No goal scorers found.</p>
        )}
      </div>

      {/* Top 10 Assist Leaders */}
      <div>
        <h3 className="text-xl font-bold mb-2">Top 10 Assists</h3>
        {topAssistLeaders.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NHL
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assists
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {topAssistLeaders.map((player: TopSkater) => (
                  <tr
                    key={`assist-${player.id}`}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center group">
                        <div className="flex-shrink-0 h-6 w-6">
                          <img
                            src={player.headshot}
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                        <div className="ml-2">
                          <a
                            href={`https://www.nhl.com/player/${player.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-[#6D4C9F] hover:underline font-medium group-hover:underline"
                          >
                            {player.lastName}
                          </a>
                        </div>
                        <span>
                          <svg
                            className="w-3 h-3 ml-1 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>{" "}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={`https://www.nhl.com/${getNHLTeamUrlSlug(player.teamAbbrev)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center group"
                      >
                        <div className="flex items-center">
                          <img
                            src={player.teamLogo}
                            alt={player.teamAbbrev}
                            className="h-5 w-5 rounded mr-2"
                          />
                          <span className="text-sm text-gray-900 group-hover:text-[#6D4C9F] group-hover:underline hidden sm:table-cell">
                            {player.teamAbbrev}
                          </span>
                          <span>
                            {" "}
                            <svg
                              className="w-3 h-3 ml-1 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>{" "}
                          </span>
                        </div>
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {player.fantasyTeam ? (
                        <Link
                          to={`/teams/${player.fantasyTeam.teamId}`}
                          className="inline-flex items-center hover:underline text-[#6D4C9F] font-medium"
                        >
                          <span>{player.fantasyTeam.teamName}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">
                      {player.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No assist leaders found.</p>
        )}
      </div>
    </div>
  );
};

export default TopSkaters;
