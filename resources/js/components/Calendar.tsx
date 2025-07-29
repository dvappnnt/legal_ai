import React, { useState } from 'react';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonthDays = daysInMonth(year, month - 1);
    const days: CalendarDay[] = [];

    // Add days from the previous month
    for (let i = startDay; i > 0; i--) {
      days.push({
        date: prevMonthDays - i + 1,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Add days from the current month
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: isToday,
        isSelected: isSelected,
      });
    }

    // Add days from the next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  };

  const handlePrevMonth = (): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = (): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleDayClick = (dayObject: CalendarDay): void => {
    if (dayObject.isCurrentMonth) {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObject.date);
      setSelectedDate(newSelectedDate);
    }
  };

  const weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="text-gray-600 hover:text-gray-800 focus:outline-none">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={handleNextMonth} className="text-gray-600 hover:text-gray-800 focus:outline-none">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-accent_blue mb-2 text-[#212121]">
        {weekdays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              p-2 rounded-full cursor-pointer
              ${day.isSelected 
                ? 'bg-[#f0f0f0] text-[#145275] font-semibold shadow-md' 
                : day.isCurrentMonth 
                  ? 'text-gray-800 hover:bg-gray-100' 
                  : 'text-accent_blue opacity-60'}
              ${day.isToday ? ' bg-[#145275] text-[#1B3C53] font-semibold shadow-md' : ''}
            `}
            onClick={() => handleDayClick(day)}
          >
            {day.date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;