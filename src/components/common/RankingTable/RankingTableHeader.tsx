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
    <div className="flex justify-between items-center p-4 border-b border-gray-100">
      <div>
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {dateBadge && <p className="text-sm text-gray-500">{formattedDate}</p>}
      </div>

      {showViewAll && viewAllLink && (
        <Link
          to={viewAllLink}
          className="text-[#6D4C9F] hover:text-[#5A3A87] flex items-center font-medium transition-colors"
        >
          {viewAllText} <span className="ml-1">→</span>
        </Link>
      )}
    </div>
  );
};

export default RankingTableHeader;
