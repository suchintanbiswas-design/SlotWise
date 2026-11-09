import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useMyBookings, useCancelBooking, useResources } from '../hooks/useBookingData';
import {
    Calendar,
    Clock,
    Building2,
    CheckCircle2,
    Clock3,
    XCircle,
    CheckCheck,
    Compass,
    Sparkles,
    Loader2
} from 'lucide-react';
import { cn } from '../utils/cn';

type BookingTab = 'ALL' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

const Bookings: React.FC = () => {
    const { data: bookings, isLoading: loadingBookings } = useMyBookings();
    const { data: resources } = useResources();
    const cancelBooking = useCancelBooking();

    const [activeTab, setActiveTab] = useState<BookingTab>('ALL');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Helpers to resolve resource building location
    const getResourceLocation = (resourceId: string) => {
        const res = resources?.find((r) => r.id === resourceId);
        return res?.buildingName ? `${res.buildingName} • VIT Chennai` : 'Academic Block 1 • VIT Chennai';
    };

    // Date formatting
    const formatDate = (isoString: string) => {
        try {
            return format(new Date(isoString), 'EEE, MMM d, yyyy');
        } catch {
            return 'Date TBA';
        }
    };

    const formatTimeInterval = (startsAt: string, endsAt: string) => {
        try {
            return `${format(new Date(startsAt), 'h:mm a')} – ${format(new Date(endsAt), 'h:mm a')}`;
        } catch {
            return 'Time TBA';
        }
    };

    // Categorized bookings and counts
    const { allList, confirmedList, pendingList, completedList, cancelledList } = useMemo(() => {
        if (!bookings) {
            return {
                allList: [],
                confirmedList: [],
                pendingList: [],
                completedList: [],
                cancelledList: [],
            };
        }

        const now = new Date();
        const sorted = [...bookings].sort(
            (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
        );

        const confirmed = sorted.filter(
            (b) => b.status === 'CONFIRMED' && new Date(b.endsAt) >= now
        );
        const pending = sorted.filter((b) => b.status === 'PENDING');
        const completed = sorted.filter(
            (b) => b.status === 'CONFIRMED' && new Date(b.endsAt) < now
        );
        const cancelled = sorted.filter(
            (b) => b.status === 'CANCELLED' || b.status === 'REJECTED'
        );

        return {
            allList: sorted,
            confirmedList: confirmed,
            pendingList: pending,
            completedList: completed,
            cancelledList: cancelled,
        };
    }, [bookings]);

    // Active displayed list based on tab
    const displayedBookings = useMemo(() => {
        switch (activeTab) {
            case 'CONFIRMED':
                return confirmedList;
            case 'PENDING':
                return pendingList;
            case 'COMPLETED':
                return completedList;
            case 'CANCELLED':
                return cancelledList;
            case 'ALL':
            default:
                return allList;
        }
    }, [activeTab, allList, confirmedList, pendingList, completedList, cancelledList]);

    // Handle booking cancellation
    const handleCancel = async (bookingId: string) => {
        setCancellingId(bookingId);
        try {
            await cancelBooking.mutateAsync(bookingId);
            toast.success('Reservation cancelled successfully.');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to cancel reservation.');
        } finally {
            setCancellingId(null);
        }
    };

    // Render status badge
    const renderStatusPill = (status: string, endsAt: string) => {
        const isPast = new Date(endsAt) < new Date();

        if (status === 'CONFIRMED' && isPast) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    Completed
                </span>
            );
        }

        switch (status) {
            case 'CONFIRMED':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Confirmed
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock3 className="w-3.5 h-3.5 mr-1" />
                        Pending
                    </span>
                );
            case 'CANCELLED':
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        {status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {status}
                    </span>
                );
        }
    };

    const tabs: { key: BookingTab; label: string; count: number }[] = [
        { key: 'ALL', label: 'All bookings', count: allList.length },
        { key: 'CONFIRMED', label: 'Confirmed', count: confirmedList.length },
        { key: 'PENDING', label: 'Pending', count: pendingList.length },
        { key: 'COMPLETED', label: 'Completed', count: completedList.length },
        { key: 'CANCELLED', label: 'Cancelled', count: cancelledList.length },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* 1. Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    My{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400">
                        bookings.
                    </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Keep your reservations, requests and updates in one view.
                </p>
            </div>

            {/* 2. Navigation Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800/80 -mx-8 px-8 flex items-center gap-2 overflow-x-auto no-scrollbar transition-colors duration-200">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'pb-3.5 pt-1 px-3 text-xs font-semibold transition-all relative flex items-center gap-2 shrink-0 border-b-2',
                                isActive
                                    ? 'text-slate-900 dark:text-white border-blue-500'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                            )}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                                    isActive
                                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                )}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 3. Data Table */}
            {loadingBookings ? (
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm shadow-sm">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading your reservations...
                </div>
            ) : displayedBookings.length === 0 ? (
                <div className="bg-white dark:bg-[#121212] border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No bookings found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        There are no reservations under the "{activeTab.toLowerCase()}" category.
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/resources"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue transition-colors"
                        >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Reserve a space</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 dark:bg-[#0a0a0a]/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">
                                        Resource
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Date & Time
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Purpose
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {displayedBookings.map((b) => {
                                    const isActionable =
                                        (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
                                        new Date(b.endsAt) >= new Date();
                                    const isCancelling = cancellingId === b.id;

                                    return (
                                        <tr
                                            key={b.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                                        >
                                            {/* 1. RESOURCE */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-900 dark:text-white block text-sm group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                                            {b.resourceName}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                            {getResourceLocation(b.resourceId)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. DATE & TIME */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">
                                                        {formatDate(b.startsAt)}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                        {formatTimeInterval(b.startsAt, b.endsAt)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 3. PURPOSE */}
                                            <td className="px-6 py-4">
                                                <span className="text-slate-700 dark:text-slate-300 text-xs line-clamp-1 max-w-xs">
                                                    {b.purpose ? (
                                                        b.purpose
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500 italic">
                                                            General Academic Use
                                                        </span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* 4. STATUS */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStatusPill(b.status, b.endsAt)}
                                            </td>

                                            {/* 5. ACTIONS */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                {isActionable ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancel(b.id)}
                                                        disabled={isCancelling}
                                                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline transition-colors px-2.5 py-1 rounded disabled:opacity-50"
                                                    >
                                                        {isCancelling ? 'Cancelling...' : 'Cancel'}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-600 px-2.5">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
