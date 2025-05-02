import React from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  formatDisplayDate,
  toLocalDateString,
  dateStringToLocalDate,
} from "../../../utils/timezone";

interface RankingTableHeaderProps {
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  showViewAll?: boolean;
  dateBadge?: string | Date;

  // Date picker props
  showDatePicker?: boolean;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const RankingTableHeader: React.FC<RankingTableHeaderProps> = ({
  title,
  subtitle,
  viewAllLink,
  viewAllText = "View All",
  showViewAll = false,
  dateBadge,

  // DatePicker props with defaults
  showDatePicker = false,
  selectedDate,
  onDateChange,
}) => {
  if (!title && !dateBadge && !viewAllLink && !showDatePicker) return null;

  // Format date badge
  const formattedDate =
    showDatePicker && selectedDate
      ? formatDisplayDate(dateStringToLocalDate(selectedDate), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : typeof dateBadge === "string"
        ? dateBadge
        : dateBadge instanceof Date
          ? formatDisplayDate(dateBadge, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "";

  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    if (newDate && onDateChange) {
      onDateChange(toLocalDateString(newDate));
    }
  };

  // Handle previous and next day
  const handlePrevDay = () => {
    if (selectedDate && onDateChange) {
      const date = dateStringToLocalDate(selectedDate);
      date.setDate(date.getDate() - 1);
      onDateChange(toLocalDateString(date));
    }
  };

  const handleNextDay = () => {
    if (selectedDate && onDateChange) {
      const date = dateStringToLocalDate(selectedDate);
      date.setDate(date.getDate() + 1);
      onDateChange(toLocalDateString(date));
    }
  };

  // Handle going to yesterday
  const handleYesterday = () => {
    if (onDateChange) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      onDateChange(toLocalDateString(yesterday));
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
      {/* Left side - Title and badge */}
      <div>
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}

        {/* Always show date badge */}
        {(formattedDate || (showDatePicker && selectedDate)) && (
          <div className="inline-flex items-center mt-1">
            <span className="bg-yellow-300/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">
              {formattedDate ||
                (selectedDate &&
                  formatDisplayDate(dateStringToLocalDate(selectedDate)))}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Date picker controls - always visible when showDatePicker is true */}
        {showDatePicker && (
          <div className="flex flex-wrap items-center gap-2 bg-white/10 rounded-lg p-2">
            {/* Mobile-friendly controls */}
            <div className="flex items-center">
              <button
                onClick={handlePrevDay}
                className="p-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous day"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <DatePicker
                selected={
                  selectedDate ? dateStringToLocalDate(selectedDate) : null
                }
                onChange={handleDateChange}
                customInput={
                  <button className="mx-2 bg-white/10 px-3 py-1 rounded-md text-white focus:outline-none">
                    {selectedDate
                      ? dateStringToLocalDate(selectedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "Select date"}
                  </button>
                }
                popperPlacement="bottom-end"
                popperModifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      boundary: document.body,
                    },
                  },
                ]}
              />

              <button
                onClick={handleNextDay}
                className="p-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next day"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Quick navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleYesterday}
                className="px-2 py-1 text-xs rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Yesterday
              </button>
            </div>
          </div>
        )}

        {/* View All link */}
        {showViewAll && viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-yellow-300 hover:text-yellow-200 flex items-center font-medium transition-colors"
          >
            {viewAllText} <span className="ml-1">→</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default RankingTableHeader;
