import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDropdownProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
  placeholder: string;
}

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  value,
  onChange,
  label,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Month names translation
  const months = [
    t('common.months.january') || 'January',
    t('common.months.february') || 'February',
    t('common.months.march') || 'March',
    t('common.months.april') || 'April',
    t('common.months.may') || 'May',
    t('common.months.june') || 'June',
    t('common.months.july') || 'July',
    t('common.months.august') || 'August',
    t('common.months.september') || 'September',
    t('common.months.october') || 'October',
    t('common.months.november') || 'November',
    t('common.months.december') || 'December',
  ];

  // Weekday names
  const weekdays = [
    t('common.days.sunday') || 'Su',
    t('common.days.monday') || 'Mo',
    t('common.days.tuesday') || 'Tu',
    t('common.days.wednesday') || 'We',
    t('common.days.thursday') || 'Th',
    t('common.days.friday') || 'Fr',
    t('common.days.saturday') || 'Sa',
  ];

  // Generate years range (1950-2050)
  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);

  // Get days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Handle date selection
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      onChange(dateString);
      setSelectedDate(date);
      setIsOpen(false);
    }
  };

  // Handle month change
  const handleMonthChange = (month: number) => {
    const newDate = new Date(currentDate.getFullYear(), month, currentDate.getDate());
    setCurrentDate(newDate);
    setView('days');
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), currentDate.getDate());
    setCurrentDate(newDate);
    setView('days');
  };

  // Navigate to next/previous month
  const prevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      currentDate.getDate()
    );
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );
    setCurrentDate(newDate);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>

      <div className="relative">
        <input
          type="text"
          value={selectedDate ? selectedDate.toLocaleDateString() : ''}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary pr-10 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-bg-primary border border-border rounded-xl shadow-lg w-72">
          {view === 'days' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevMonth();
                  }}
                  className="p-1 rounded hover:bg-bg-secondary"
                >
                  <ChevronLeft className="w-5 h-5 text-text-secondary" />
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setView('months');
                    }}
                    className="font-medium text-text-primary hover:underline"
                  >
                    {months[currentDate.getMonth()]}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setView('years');
                    }}
                    className="font-medium text-text-primary hover:underline"
                  >
                    {currentDate.getFullYear()}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextMonth();
                  }}
                  className="p-1 rounded hover:bg-bg-secondary"
                >
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekdays.map((day, index) => (
                  <div key={index} className="text-center text-xs text-text-tertiary py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day && handleDateSelect(day)}
                    disabled={!day}
                    className={`
                      w-8 h-8 rounded-full text-sm flex items-center justify-center
                      ${
                        !day
                          ? 'invisible'
                          : selectedDate &&
                              day &&
                              day.toDateString() === selectedDate.toDateString()
                            ? 'bg-accent-primary text-white'
                            : day && day.toDateString() === new Date().toDateString()
                              ? 'bg-bg-secondary text-text-primary'
                              : 'text-text-secondary hover:bg-bg-secondary'
                      }
                    `}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'months' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleYearChange(currentDate.getFullYear() - 1)}
                  className="p-1 rounded hover:bg-bg-secondary"
                >
                  <ChevronLeft className="w-5 h-5 text-text-secondary" />
                </button>

                <button
                  onClick={() => setView('years')}
                  className="font-medium text-text-primary hover:underline"
                >
                  {currentDate.getFullYear()}
                </button>

                <button
                  onClick={() => handleYearChange(currentDate.getFullYear() + 1)}
                  className="p-1 rounded hover:bg-bg-secondary"
                >
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleMonthChange(index)}
                    className={`
                      py-2 text-sm rounded-lg
                      ${
                        currentDate.getMonth() === index
                          ? 'bg-accent-primary text-white'
                          : 'text-text-secondary hover:bg-bg-secondary'
                      }
                    `}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'years' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleYearChange(currentDate.getFullYear() - 12)}
                  className="p-1 rounded hover:bg-bg-secondary"
                >
                  <ChevronLeft className="w-5 h-5 text-text-secondary" />
                </button>

                <div className="font-medium text-text-primary">
                  {currentDate.getFullYear() - 6} - {currentDate.getFullYear() + 5}
                </div>

                <button
                  onClick={() => handleYearChange(currentDate.getFullYear() + 12)}
                  className="p-1 rounded hover:bg-bg-secondary"
                >
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {years
                  .filter(
                    (year) =>
                      year >= currentDate.getFullYear() - 6 && year <= currentDate.getFullYear() + 5
                  )
                  .map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearChange(year)}
                      className={`
                        py-2 text-sm rounded-lg
                        ${
                          currentDate.getFullYear() === year
                            ? 'bg-accent-primary text-white'
                            : 'text-text-secondary hover:bg-bg-secondary'
                        }
                      `}
                    >
                      {year}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarDropdown;
