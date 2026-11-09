import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useResources, useMyBookings, useCancelBooking } from '../hooks/useBookingData';
import {
    Calendar,
    Clock,
    MapPin,
    Compass,
    ArrowRight,
    Search,
    CheckCircle2,
    Clock3,
    Bell,
    XCircle,
    Building2,
    Users,
    Layers,
    Sparkles,
    CalendarDays
} from 'lucide-react';

const getResourceImage = (type: string, name: string) => {
    const t = type.toUpperCase();
    if (t.includes('LAB')) return 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'; // Tech Lab
    if (t.includes('AUDITORIUM') || name.includes('Hall')) return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800'; // Auditorium
    if (t.includes('MEETING') || t.includes('STUDY')) return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'; // Meeting room
    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800'; // Default modern space
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { data: resources, isLoading: loadingResources } = useResources();
    const { data: bookings, isLoading: loadingBookings } = useMyBookings();
    const cancelBooking = useCancelBooking();

    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic greeting based on time of day
    const greetingText = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const userDisplayName = user?.fullName ? user.fullName.split(' ')[0] : 'there';

    // Calculate live metric counts from user bookings
    const metrics = useMemo(() => {
        if (!bookings) {
            return { upcoming: 0, pending: 0, confirmed: 0, notifications: 0 };
        }
        const now = new Date();
        const upcoming = bookings.filter(
            (b) => b.status === 'CONFIRMED' && new Date(b.endsAt) >= now
        ).length;
        const pending = bookings.filter((b) => b.status === 'PENDING').length;
        const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
        const notifications = pending;
        return { upcoming, pending, confirmed, notifications };
    }, [bookings]);

    // Sorted schedule: most imminent bookings first
    const scheduleBookings = useMemo(() => {
        if (!bookings) return [];
        return [...bookings].sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );
    }, [bookings]);

    // Quick-search filtered resources for "Get Moving" section
    const quickResources = useMemo(() => {
        if (!resources) return [];
        if (!searchQuery.trim()) return resources.slice(0, 3);
        const q = searchQuery.toLowerCase();
        return resources
            .filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    r.resourceType.toLowerCase().includes(q) ||
                    r.buildingName?.toLowerCase().includes(q)
            )
            .slice(0, 3);
    }, [resources, searchQuery]);

    // Format date block: day number and uppercase month
    const formatScheduleDate = (startsAt: string) => {
        try {
            const date = new Date(startsAt);
            return {
                day: format(date, 'd'),
                month: format(date, 'MMM').toUpperCase(),
            };
        } catch {
            return { day: '01', month: 'JAN' };
        }
    };

    // Format human-friendly time interval
    const formatTimeWindow = (startsAt: string, endsAt: string) => {
        try {
            const start = new Date(startsAt);
            const end = new Date(endsAt);
            return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
        } catch {
            return 'Time TBA';
        }
    };

    // Resolve resource building location
    const getResourceLocation = (resourceId: string) => {
        const res = resources?.find((r) => r.id === resourceId);
        return res?.buildingName ? `${res.buildingName} • VIT Chennai` : 'Academic Block • VIT Chennai';
    };

    const handleCancel = async (bookingId: string) => {
        try {
            await cancelBooking.mutateAsync(bookingId);
            toast.success('Reservation cancelled successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to cancel reservation');
        }
    };

    const renderStatusBadge = (status: string) => {
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
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancelled
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* 1. Greeting Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {greetingText},{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400">
                            {userDisplayName}.
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Here's what's happening across your campus workspace.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/resources"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold shadow-glow-blue transition-all group shrink-0"
                    >
                        <Compass className="w-4 h-4" />
                        <span>Find a resource</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* 2. Metric Cards (Top Row, 4-column grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Upcoming bookings */}
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Upcoming bookings
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {loadingBookings ? '...' : metrics.upcoming}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Keep your schedule moving</p>
                    </div>
                </div>

                {/* Pending requests */}
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Pending requests
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                            <Clock3 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {loadingBookings ? '...' : metrics.pending}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Awaiting administrator review</p>
                    </div>
                </div>

                {/* Confirmed reservations */}
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Confirmed reservations
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {loadingBookings ? '...' : metrics.confirmed}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active reserved campus slots</p>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Notifications
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                            <Bell className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {loadingBookings ? '...' : metrics.notifications}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">System alerts & updates</p>
                    </div>
                </div>
            </div>

            {/* 3. Split Content Area (grid-cols-3: Left spans 2, Right spans 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Your Schedule (spans 2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                Your Schedule
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Current, upcoming, and past reservations associated with your account.
                            </p>
                        </div>
                        <Link
                            to="/bookings"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            View all bookings →
                        </Link>
                    </div>

                    {/* Schedule List */}
                    <div className="space-y-3">
                        {loadingBookings ? (
                            <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                Loading your schedule...
                            </div>
                        ) : scheduleBookings.length === 0 ? (
                            <div className="bg-white dark:bg-[#121212] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No reservations yet</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    You don't have any bookings on your calendar. Reserve a lab, hall, or room to get started.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        to="/resources"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                                    >
                                        Browse available spaces
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            scheduleBookings.map((b) => {
                                const dateInfo = formatScheduleDate(b.startsAt);
                                const isActionable = b.status === 'CONFIRMED' || b.status === 'PENDING';

                                return (
                                    <div
                                        key={b.id}
                                        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all flex items-center justify-between gap-4 group shadow-sm"
                                    >
                                        {/* Left: Date Block & Info */}
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Stacked Date Block */}
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-none">
                                                    {dateInfo.day}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                                                    {dateInfo.month}
                                                </span>
                                            </div>

                                            {/* Resource Details */}
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                                    {b.resourceName}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                        {formatTimeWindow(b.startsAt, b.endsAt)}
                                                    </span>
                                                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="flex items-center gap-1 truncate">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                                        {getResourceLocation(b.resourceId)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Status Pill & Cancel Action */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {renderStatusBadge(b.status)}
                                            {isActionable && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(b.id)}
                                                    title="Cancel reservation"
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Side: Get Moving / Quick Search (spans 1 column) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            Get Moving
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Quickly search and reserve top campus facilities.
                        </p>
                    </div>

                    {/* Minimal Functional Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rooms, labs, or blocks..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                        />
                    </div>

                    {/* Quick Book Resource Cards with Unsplash Photography */}
                    <div className="space-y-3">
                        {loadingResources ? (
                            <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                                Loading resources...
                            </div>
                        ) : quickResources.length === 0 ? (
                            <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                                No matching spaces found.
                            </div>
                        ) : (
                            quickResources.map((res) => (
                                <div
                                    key={res.id}
                                    className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
                                >
                                    {/* Unsplash Image Area with Gradient Overlay */}
                                    <div className="h-24 w-full rounded-xl bg-slate-900 relative overflow-hidden border border-slate-200 dark:border-slate-800/60 p-3 flex flex-col justify-between mb-3 group">
                                        <img
                                            src={getResourceImage(res.resourceType, res.name)}
                                            alt={res.name}
                                            className="object-cover w-full h-full absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                                        <div className="flex items-center justify-between z-10 relative">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                                                Available
                                            </span>
                                            <span className="text-[10px] text-blue-300 dark:text-blue-400 uppercase font-semibold tracking-wider bg-slate-900/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                {res.resourceType}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between z-10 relative">
                                            <div className="flex items-center gap-1.5 text-xs text-white">
                                                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-xs truncate max-w-[150px] font-medium drop-shadow-sm">
                                                    {res.buildingName || 'Academic Block 1'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-200 font-medium drop-shadow-sm">
                                                <Users className="w-3 h-3 text-slate-300" />
                                                <span>{res.capacity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content & Action */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                                {res.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Capacity: {res.capacity} attendees
                                            </p>
                                        </div>

                                        <Link
                                            to="/resources"
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                                        >
                                            <span>Book</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
