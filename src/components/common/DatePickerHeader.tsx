import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  toLocalDateString,
  dateStringToLocalDate,
  formatDisplayDate,
} from "../../utils/timezone";

interface DatePickerHeaderProps {
  title: string;
  subtitle?: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

const DatePickerHeader = ({
  title,
  subtitle,
  selectedDate,
  onDateChange,
  className = "",
}: DatePickerHeaderProps) => {
  // Convert string date to Date object
  const date = dateStringToLocalDate(selectedDate);
  const formattedDisplayDate = formatDisplayDate(date);

  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      onDateChange(toLocalDateString(newDate));
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

  return (
    <div
      className={`bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white rounded-lg shadow-md p-6 mb-6 ${className}`}
    >
      <h1 className="text-3xl font-bold mb-2 pb-2">{title}</h1>
      {subtitle && <p className="text-lg opacity-90 mb-4">{subtitle}</p>}

      <div className="bg-white/10 p-2 m-2 rounded-lg shadow-sm mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Date header */}
          <h2 className="text-lg md:text-xl pl-1 font-medium mb-4 md:mb-0">
            {formattedDisplayDate}
          </h2>

          {/* Date controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevDay}
              className="p-1 md:p-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
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

            {/* Date Picker from react-datepicker */}
            <DatePicker
              selected={date}
              onChange={handleDateChange}
              customInput={
                <button className="p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
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
                    year: "numeric",
                  })}
                </button>
              }
              popperClassName="date-picker-popper" // Add a custom class for styling
              popperPlacement="bottom-end"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />

            <button
              onClick={handleNextDay}
              className="p-1 md:p-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
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

            <button
              onClick={() => onDateChange(toLocalDateString(new Date()))}
              className="ml-2 px-2 md:px-3 py-1 md:py-2 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerHeader;
