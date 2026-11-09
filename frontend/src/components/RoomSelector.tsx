import React from 'react';
import type { Resource } from '../types/booking';
import {
    Monitor,
    Presentation,
    Users,
    GraduationCap,
    DoorOpen,
    CheckCircle2,
    ShieldAlert,
    Building2,
    Briefcase
} from 'lucide-react';
import { cn } from '../utils/cn';

interface RoomSelectorProps {
    resources: Resource[] | undefined;
    selectedResourceId: string;
    onSelect: (resourceId: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
    resources,
    selectedResourceId,
    onSelect,
    isLoading = false,
    disabled = false,
}) => {
    const getResourceIcon = (type: string) => {
        const normalized = (type || '').toUpperCase();
        if (normalized.includes('LAB') || normalized.includes('COMPUTER')) {
            return Monitor;
        }
        if (normalized.includes('AUDITORIUM') || normalized.includes('HALL') || normalized.includes('SEMINAR')) {
            return Presentation;
        }
        if (normalized.includes('CLASS') || normalized.includes('LECTURE')) {
            return GraduationCap;
        }
        if (normalized.includes('CONF') || normalized.includes('MEETING')) {
            return Briefcase;
        }
        if (normalized.includes('BUILDING')) {
            return Building2;
        }
        return DoorOpen;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 h-28 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-center">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                            <div className="w-14 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!resources || resources.length === 0) {
        return (
            <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <DoorOpen className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No resource spaces available.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Please check back later or contact your administrator.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((resource) => {
                const IconComponent = getResourceIcon(resource.resourceType);
                const isSelected = resource.id === selectedResourceId;

                return (
                    <button
                        key={resource.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(resource.id)}
                        className={cn(
                            'group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
                            isSelected
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-soft ring-1 ring-indigo-500'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm',
                            disabled && 'opacity-60 cursor-not-allowed'
                        )}
                    >
                        {/* Top row: Icon + badges */}
                        <div className="flex items-start justify-between mb-3">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                )}
                            >
                                <IconComponent className="w-5 h-5" />
                            </div>

                            <div className="flex items-center gap-1.5">
                                {resource.approvalRequired && (
                                    <span
                                        title="Approval required by Faculty/Admin"
                                        className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60"
                                    >
                                        <ShieldAlert className="w-3 h-3" />
                                        Review
                                    </span>
                                )}
                                {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                )}
                            </div>
                        </div>

                        {/* Room details */}
                        <div>
                            <div className="flex items-baseline justify-between gap-1">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                    {resource.name}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                                {resource.resourceType.toLowerCase()}
                            </p>

                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                                <span>Capacity: <strong className="font-semibold text-slate-700 dark:text-slate-300">{resource.capacity}</strong></span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default RoomSelector;

