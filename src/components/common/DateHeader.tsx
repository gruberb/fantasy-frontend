import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  toLocalDateString,
  dateStringToLocalDate,
  formatDisplayDate,
} from "../../utils/timezone";

interface DateHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  isFloating?: boolean;
}

const DateHeader = ({
  selectedDate,
  onDateChange,
  isFloating = true,
}: DateHeaderProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Convert string date to Date object
  const date = dateStringToLocalDate(selectedDate);
  const formattedDisplayDate = formatDisplayDate(date, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      onDateChange(toLocalDateString(newDate));
      setIsCalendarOpen(false);
    }
  };

  // Previous day handler
  const handlePrevDay = () => {
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    onDateChange(toLocalDateString(prevDate));
  };

  // Next day handler
  const handleNextDay = () => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    onDateChange(toLocalDateString(nextDate));
  };

  // Today handler
  const handleToday = () => {
    onDateChange(toLocalDateString(new Date()));
  };

  // Handle scroll for floating behavior
  useEffect(() => {
    if (!isFloating) return;

    const handleScroll = () => {
      // Hide when scrolling down, show when scrolling up
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= 0 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFloating, lastScrollY]);

  // Close calendar when clicking outside
  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCalendarOpen]);

  return (
    <div
      className={`${
        isFloating
          ? "sticky top-16 z-30 transition-all duration-300 bg-white rounded-lg shadow-md border border-gray-200"
          : ""
      } ${isFloating && !isVisible ? "-translate-y-full opacity-0" : ""}`}
    >
      <div className="flex items-center justify-between p-3">
        <div className="text-sm font-medium">{formattedDisplayDate}</div>

        <div className="flex items-center gap-1" ref={datePickerRef}>
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D4C9F]"
            aria-label="Previous day"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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

          <div className="relative">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D4C9F]"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              <svg
                className={`ml-1 w-4 h-4 transform transition-transform ${
                  isCalendarOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isCalendarOpen && (
              <div className="absolute right-0 mt-1 z-50">
                <DatePicker
                  selected={date}
                  onChange={handleDateChange}
                  inline
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D4C9F]"
            aria-label="Next day"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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

          <button
            onClick={handleToday}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D4C9F]"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateHeader;
