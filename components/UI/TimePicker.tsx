import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  timeIntervals?: number; // 时间间隔（分钟）
}

/**
 * 自定义时间选择器组件，样式与react-day-picker保持一致
 * 支持下拉选择和键盘输入
 */
const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "选择时间",
  className = "",
  disabled = false,
  timeIntervals = 30,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLDivElement>(null);

  // 生成时间选项
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeIntervals) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // 更新输入值
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 滚动到选中的选项
  useEffect(() => {
    if (isOpen && selectedOptionRef.current && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const selectedOption = selectedOptionRef.current;
      const dropdownRect = dropdown.getBoundingClientRect();
      const optionRect = selectedOption.getBoundingClientRect();
      
      if (optionRect.top < dropdownRect.top || optionRect.bottom > dropdownRect.bottom) {
        selectedOption.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [isOpen]);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setInputValue(time);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // 验证时间格式 (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      const currentIndex = timeOptions.indexOf(value);
      const nextIndex = Math.min(currentIndex + 1, timeOptions.length - 1);
      if (nextIndex !== currentIndex) {
        handleTimeSelect(timeOptions[nextIndex]);
      }
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      const currentIndex = timeOptions.indexOf(value);
      const prevIndex = Math.max(currentIndex - 1, 0);
      if (prevIndex !== currentIndex) {
        handleTimeSelect(timeOptions[prevIndex]);
      }
    }
  };

  const baseClassName = `relative w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${className}`;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
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
        <Clock
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          size={16}
        />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            {timeOptions.map((time) => {
              const isSelected = time === value;
              return (
                <div
                  key={time}
                  ref={isSelected ? selectedOptionRef : null}
                  onClick={() => handleTimeSelect(time)}
                  className={`px-3 py-2 rounded cursor-pointer transition-colors duration-150 text-sm ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  }`}
                >
                  {time}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;