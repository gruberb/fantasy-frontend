import React from "react";
import { Link } from "react-router-dom";
import { formatDisplayDate } from "../../../utils/timezone";

interface RankingTableHeaderProps {
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  showViewAll?: boolean;
  dateBadge?: string | Date;
}

const RankingTableHeader: React.FC<RankingTableHeaderProps> = ({
  title,
  subtitle,
  viewAllLink,
  viewAllText = "View All",
  showViewAll = false,
  dateBadge,
}) => {
  if (!title && !dateBadge && !viewAllLink) return null;

  // Format date if provided
  let formattedDate = "";
  if (dateBadge) {
    if (typeof dateBadge === "string") {
      formattedDate = dateBadge;
    } else {
      formattedDate = formatDisplayDate(dateBadge, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
        {dateBadge && (
          <div className="inline-flex items-center mt-1">
            <span className="bg-yellow-300/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">
              {formattedDate}
            </span>
          </div>
        )}
      </div>

      {showViewAll && viewAllLink && (
        <Link
          to={viewAllLink}
          className="text-yellow-300 hover:text-yellow-200 flex items-center font-medium transition-colors"
        >
          {viewAllText} <span className="ml-1">→</span>
        </Link>
      )}
    </div>
  );
};

export default RankingTableHeader;
