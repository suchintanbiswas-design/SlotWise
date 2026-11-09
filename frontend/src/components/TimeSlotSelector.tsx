import React, { useState, useMemo } from 'react';
import {
    addDays,
    format,
    isSameDay,
    startOfToday,
    setHours,
    setMinutes,
    parseISO,
    isBefore
} from 'date-fns';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface TimeSlotSelectorProps {
    selectedStartsAt: string; // ISO string
    selectedEndsAt: string;   // ISO string
    onChange: (startsAt: string, endsAt: string) => void;
    bookedSlots?: { startsAt: string; endsAt: string; status?: string }[];
    disabled?: boolean;
}

// Operating hours from 8:00 AM to 8:00 PM (12 hourly slots)
const OPERATING_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
    selectedStartsAt,
    selectedEndsAt,
    onChange,
    bookedSlots = [],
    disabled = false,
}) => {
    // Generate next 7 days starting from today
    const days = useMemo(() => {
        const today = startOfToday();
        return Array.from({ length: 7 }, (_, i) => addDays(today, i));
    }, []);

    // Selected date state (defaults to date of selectedStartsAt or today)
    const [activeDate, setActiveDate] = useState<Date>(() => {
        if (selectedStartsAt) {
            try {
                return parseISO(selectedStartsAt);
            } catch {
                return startOfToday();
            }
        }
        return startOfToday();
    });

    // Determine current start and end hours for activeDate
    const { startHour, endHour } = useMemo(() => {
        if (!selectedStartsAt || !selectedEndsAt) {
            return { startHour: null, endHour: null };
        }
        try {
            const start = parseISO(selectedStartsAt);
            const end = parseISO(selectedEndsAt);
            if (isSameDay(start, activeDate)) {
                return { startHour: start.getHours(), endHour: end.getHours() };
            }
        } catch {
            // invalid date
        }
        return { startHour: null, endHour: null };
    }, [selectedStartsAt, selectedEndsAt, activeDate]);

    // Check if an hour slot on activeDate overlaps with bookedSlots or is in past
    const isSlotDisabled = (hour: number) => {
        const slotStart = setMinutes(setHours(activeDate, hour), 0);
        const slotEnd = setMinutes(setHours(activeDate, hour + 1), 0);
        const now = new Date();

        // Disable past slots if viewing today
        if (isBefore(slotStart, now)) {
            return true;
        }

        // Check conflicts with existing bookings
        return bookedSlots.some((slot) => {
            if (slot.status === 'CANCELLED' || slot.status === 'REJECTED') {
                return false;
            }
            try {
                const bStart = typeof slot.startsAt === 'string' ? parseISO(slot.startsAt) : new Date(slot.startsAt);
                const bEnd = typeof slot.endsAt === 'string' ? parseISO(slot.endsAt) : new Date(slot.endsAt);
                return slotStart < bEnd && slotEnd > bStart;
            } catch {
                return false;
            }
        });
    };

    // Handle clicking a date from the 7-day strip
    const handleDateSelect = (date: Date) => {
        if (disabled) return;
        setActiveDate(date);

        // If there was an existing hour selection, re-apply it to the new date
        if (startHour !== null) {
            const newStart = setMinutes(setHours(date, startHour), 0);
            const targetEndHour = endHour !== null ? endHour : startHour + 1;
            const newEnd = setMinutes(setHours(date, targetEndHour), 0);
            onChange(newStart.toISOString(), newEnd.toISOString());
        }
    };

    // Handle clicking a time slot chip
    const handleSlotClick = (hour: number) => {
        if (disabled || isSlotDisabled(hour)) return;

        // If no slot is selected, or if user already had a range selected, start a fresh 1-hour slot
        if (startHour === null || (startHour !== null && endHour !== null && endHour > startHour + 1)) {
            const newStart = setMinutes(setHours(activeDate, hour), 0);
            const newEnd = setMinutes(setHours(activeDate, hour + 1), 0);
            onChange(newStart.toISOString(), newEnd.toISOString());
            return;
        }

        // If user already clicked one slot:
        if (hour === startHour) {
            // Clicked same slot again: keep 1h
            const newStart = setMinutes(setHours(activeDate, hour), 0);
            const newEnd = setMinutes(setHours(activeDate, hour + 1), 0);
            onChange(newStart.toISOString(), newEnd.toISOString());
        } else if (hour > startHour) {
            // Check if any slot in the range [startHour, hour + 1] is disabled/booked
            for (let h = startHour; h <= hour; h++) {
                if (isSlotDisabled(h)) {
                    // Block range expansion over conflict; reset to clicked slot
                    const newStart = setMinutes(setHours(activeDate, hour), 0);
                    const newEnd = setMinutes(setHours(activeDate, hour + 1), 0);
                    onChange(newStart.toISOString(), newEnd.toISOString());
                    return;
                }
            }
            // Valid range extension
            const newStart = setMinutes(setHours(activeDate, startHour), 0);
            const newEnd = setMinutes(setHours(activeDate, hour + 1), 0);
            onChange(newStart.toISOString(), newEnd.toISOString());
        } else {
            // Clicked an earlier slot: reset start to that hour
            const newStart = setMinutes(setHours(activeDate, hour), 0);
            const newEnd = setMinutes(setHours(activeDate, hour + 1), 0);
            onChange(newStart.toISOString(), newEnd.toISOString());
        }
    };

    const isSlotSelected = (hour: number) => {
        if (startHour === null || endHour === null) return false;
        return hour >= startHour && hour < endHour;
    };

    return (
        <div className="space-y-6">
            {/* Section A: 7-Day Date Strip */}
            <div>
                <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                        Select Date
                    </label>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {format(activeDate, 'MMMM yyyy')}
                    </span>
                </div>

                <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {days.map((day, idx) => {
                        const isSelected = isSameDay(day, activeDate);
                        const isToday = isSameDay(day, startOfToday());

                        return (
                            <button
                                key={idx}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleDateSelect(day)}
                                className={cn(
                                    'flex-shrink-0 flex flex-col items-center justify-center w-16 py-3 px-1.5 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
                                    isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-soft scale-105'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm',
                                    disabled && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                <span className={cn('text-xs uppercase font-semibold tracking-wider', isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500')}>
                                    {isToday ? 'Today' : format(day, 'EEE')}
                                </span>
                                <span className={cn('text-lg font-bold mt-0.5', isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100')}>
                                    {format(day, 'd')}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Section B: Time Slot Chips */}
            <div>
                <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                        Select Hours
                    </label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {startHour !== null && endHour !== null
                            ? `${endHour - startHour} hr reservation`
                            : 'Click slot to set window'}
                    </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {OPERATING_HOURS.map((hour) => {
                        const disabledSlot = isSlotDisabled(hour);
                        const selected = isSlotSelected(hour);
                        const isStart = hour === startHour;
                        const isEndEdge = hour === (endHour !== null ? endHour - 1 : startHour);

                        // Format 12-hour display: e.g. "09:00 AM"
                        const slotDate = setHours(new Date(), hour);
                        const timeLabel = format(slotDate, 'hh:00 a');

                        return (
                            <button
                                key={hour}
                                type="button"
                                disabled={disabled || disabledSlot}
                                onClick={() => handleSlotClick(hour)}
                                title={disabledSlot ? 'Unavailable / Already booked' : `Select ${timeLabel}`}
                                className={cn(
                                    'py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all duration-150 focus:outline-none flex flex-col items-center justify-center',
                                    disabledSlot
                                        ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 line-through cursor-not-allowed border-dashed'
                                        : selected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs',
                                    isStart && selected && 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900',
                                    isEndEdge && selected && 'font-bold'
                                )}
                            >
                                <span>{timeLabel}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Window Summary Alert */}
                {selectedStartsAt && selectedEndsAt && (
                    <div className="mt-3.5 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                                <strong>{format(activeDate, 'EEEE, MMM d')}:</strong>{' '}
                                {format(parseISO(selectedStartsAt), 'hh:mm a')} –{' '}
                                {format(parseISO(selectedEndsAt), 'hh:mm a')}
                            </span>
                        </div>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 ml-2 whitespace-nowrap">
                            ({endHour! - startHour!} hr)
                        </span>
                    </div>
                )}

                {/* Helper notice if no slots selected */}
                {(!selectedStartsAt || !selectedEndsAt) && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                        Click a start hour, then click a later hour to extend the duration.
                    </p>
                )}
            </div>
        </div>
    );
};

export default TimeSlotSelector;

