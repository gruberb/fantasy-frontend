// src/components/TopSkaters.tsx
import React from "react";
import { TopSkatersResponse, TopSkater } from "../api/client";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Link } from "react-router-dom";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Top 10 Goal Scorers */}
      <div>
        <h3 className="text-xl font-bold mb-2">Top 10 Scorers</h3>
        {data?.goals && data.goals.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-left">Team</th>
                  <th className="py-3 px-4 text-left">Fantasy Team</th>
                  <th className="py-3 px-4 text-left">Goals</th>
                </tr>
              </thead>
              <tbody>
                {data.goals.map((player: TopSkater) => (
                  <tr
                    key={`goal-${player.id}`}
                    className="border-t hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 whitespace-nowrap flex items-center space-x-2">
                      <img
                        src={player.headshot}
                        alt={`${player.first_name} ${player.last_name}`}
                        className="w-6 h-6 rounded-full"
                      />
                      <a
                        href={`https://www.nhl.com/player/${player.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:underline flex items-center whitespace-nowrap"
                      >
                        {player.first_name} {player.last_name}
                        <span className="ml-1 text-gray-500 text-sm inline-block">
                          ↗
                        </span>
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={`https://www.nhl.com/team/${player.team_abbrev.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center hover:underline"
                      >
                        <img
                          src={player.team_logo}
                          alt={player.team_abbrev}
                          className="w-5 h-5 rounded"
                        />
                        <span>{player.team_abbrev}</span>
                        <span className="ml-1 text-gray-500 text-sm inline-block">
                          ↗
                        </span>
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {player.fantasy_team ? (
                        <Link
                          to={`/teams/${player.fantasy_team.team_id}`}
                          className="inline-flex items-center hover:underline"
                        >
                          <span>{player.fantasy_team.team_name}</span>
                          <span className="ml-1 text-gray-500 text-sm inline-block">
                            →
                          </span>
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
        {data?.assists && data.assists.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-left">NHL</th>
                  <th className="py-3 px-4 text-left">Team</th>
                  <th className="py-3 px-4 text-left">Assists</th>
                </tr>
              </thead>
              <tbody>
                {data.assists.map((player: TopSkater) => (
                  <tr
                    key={`assist-${player.id}`}
                    className="border-t hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 whitespace-nowrap flex items-center space-x-2">
                      <img
                        src={player.headshot}
                        alt={`${player.first_name} ${player.last_name}`}
                        className="w-6 h-6 rounded-full"
                      />
                      <a
                        href={`https://www.nhl.com/player/${player.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:underline flex items-center whitespace-nowrap"
                      >
                        {player.first_name} {player.last_name}
                        <span className="ml-1 text-gray-500 text-sm inline-block">
                          ↗
                        </span>
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={`https://www.nhl.com/team/${player.team_abbrev.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center hover:underline"
                      >
                        <img
                          src={player.team_logo}
                          alt={player.team_abbrev}
                          className="w-5 h-5 rounded"
                        />
                        <span>{player.team_abbrev}</span>
                        <span className="ml-1 text-gray-500 text-sm inline-block">
                          ↗
                        </span>
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {player.fantasy_team ? (
                        <Link
                          to={`/teams/${player.fantasy_team.team_id}`}
                          className="inline-flex items-center hover:underline"
                        >
                          <span>{player.fantasy_team.team_name}</span>
                          <span className="ml-1 text-gray-500 text-sm inline-block">
                            →
                          </span>
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
