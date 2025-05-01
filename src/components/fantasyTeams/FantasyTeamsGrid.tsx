import { NHLTeam } from "../../types/fantasyTeams";
import FantasyTeamCard from "./FantasyTeamCard";
import FantasyEmptyTeamsState from "./EmptyFantasyTeamsState";
import { useEffect, useState } from "react";

interface FantasyTeamsGridProps {
  teams: NHLTeam[];
}

export default function TeamsGrid({ teams }: FantasyTeamsGridProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation on mount
  useEffect(() => {
    setIsAnimating(true);
    // Turn off animation class after animations complete
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (teams.length === 0) {
    return <FantasyEmptyTeamsState />;
  }

  return (
    <div className="relative">
      {/* Decorative elements */}
      <div className="hidden lg:block absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-[#6D4C9F]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="hidden lg:block absolute -left-20 top-40 w-72 h-72 bg-gradient-to-tr from-[#FFB81C]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Teams grid with animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map((team, index) => (
          <div
            key={team.id}
            className={`${isAnimating ? "animate-fade-up" : ""}`}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "both",
            }}
          >
            <FantasyTeamCard team={team} />
          </div>
        ))}
      </div>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
