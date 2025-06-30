import { Link } from "react-router-dom";
import { getFixedAnalysisDateString } from "../../utils/timezone";

export default function ActionButtons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Link
        to="/fantasy-teams"
        className="bg-[#6D4C9F] hover:bg-[#5A3A87] text-white py-3 px-4 rounded-md shadow-sm font-medium transition-colors text-center"
      >
        View All Teams
      </Link>
      <Link
        to={`/games/${getFixedAnalysisDateString()}`}
        className="bg-[#041E42] hover:bg-[#0A2D5A] text-white py-3 px-4 rounded-md shadow-sm font-medium transition-colors text-center"
      >
        Game Center
      </Link>
      <Link
        to="/rankings"
        className="bg-gradient-to-r from-[#AF1E2D] to-[#C8102E] hover:from-[#9A1B28] hover:to-[#B30E29] text-white py-3 px-4 rounded-md shadow-sm font-medium transition-colors text-center"
      >
        View Full Rankings
      </Link>
    </div>
  );
}
