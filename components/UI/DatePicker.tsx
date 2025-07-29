import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Select date",
  className = "",
  dateFormat = "MMM d, yyyy",
  showTimeSelect = false,
  timeFormat = "HH:mm",
  timeIntervals = 15,
  minDate,
  maxDate,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseClassName = `w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`;

  // Update input value when selected date changes
  useEffect(() => {
    if (selected) {
      const formattedDate = dayjs(selected).format(dateFormat === "MMM d, yyyy" ? "MMM D, YYYY" : dateFormat);
      setInputValue(formattedDate);
    } else {
      setInputValue("");
    }
  }, [selected, dateFormat]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Try to parse the input value
    const parsedDate = dayjs(value);
    if (parsedDate.isValid()) {
      onChange(parsedDate.toDate());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={baseClassName}
        disabled={disabled}
        readOnly={false}
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <DayPicker
            mode="single"
            selected={selected || undefined}
            onSelect={handleDaySelect}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            className="p-3"
            classNames={{
              day: "hover:bg-blue-100 dark:hover:bg-blue-900 rounded",
              day_selected: "bg-blue-600 text-white hover:bg-blue-700",
              day_today: "font-bold text-blue-600 dark:text-blue-400",
              day_disabled: "text-gray-400 dark:text-gray-600",
              month: "text-gray-900 dark:text-white",
              caption: "text-gray-900 dark:text-white",
              nav_button: "hover:bg-gray-100 dark:hover:bg-gray-700 rounded",
              nav_button_previous: "text-gray-600 dark:text-gray-400",
              nav_button_next: "text-gray-600 dark:text-gray-400",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
