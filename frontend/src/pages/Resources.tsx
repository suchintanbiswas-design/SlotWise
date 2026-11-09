import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useResources, useMyBookings, useCreateBooking } from '../hooks/useBookingData';
import type { Resource } from '../types/booking';
import TimeSlotSelector from '../components/TimeSlotSelector';
import {
    Search,
    Filter,
    Users,
    Building2,
    Calendar,
    ArrowRight,
    X,
    CheckCircle2,
    ShieldAlert,
    Sparkles,
    SlidersHorizontal
} from 'lucide-react';

const getResourceImage = (type: string, name: string) => {
    const t = type.toUpperCase();
    if (t.includes('LAB')) return 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'; // Tech Lab
    if (t.includes('AUDITORIUM') || name.includes('Hall')) return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800'; // Auditorium
    if (t.includes('MEETING') || t.includes('STUDY')) return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'; // Meeting room
    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800'; // Default modern space
};

const Resources: React.FC = () => {
    const { data: resources, isLoading: loadingResources } = useResources();
    const { data: bookings } = useMyBookings();
    const createBooking = useCreateBooking();

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [buildingFilter, setBuildingFilter] = useState('ALL');
    const [capacityFilter, setCapacityFilter] = useState('ALL');

    // Booking Modal state
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [purpose, setPurpose] = useState('');
    const [bookingError, setBookingError] = useState('');

    // Unique types & buildings for dropdown filter options
    const resourceTypes = useMemo(() => {
        if (!resources) return [];
        return Array.from(new Set(resources.map((r) => r.resourceType).filter(Boolean)));
    }, [resources]);

    const buildings = useMemo(() => {
        if (!resources) return [];
        return Array.from(new Set(resources.map((r) => r.buildingName).filter(Boolean)));
    }, [resources]);

    // Filtered resources
    const filteredResources = useMemo(() => {
        if (!resources) return [];
        return resources.filter((res) => {
            // Search query
            const q = searchQuery.toLowerCase().trim();
            if (q) {
                const matchesName = res.name.toLowerCase().includes(q);
                const matchesType = res.resourceType.toLowerCase().includes(q);
                const matchesBuilding = res.buildingName?.toLowerCase().includes(q);
                if (!matchesName && !matchesType && !matchesBuilding) return false;
            }

            // Type filter
            if (typeFilter !== 'ALL' && res.resourceType !== typeFilter) {
                return false;
            }

            // Building filter
            if (buildingFilter !== 'ALL' && res.buildingName !== buildingFilter) {
                return false;
            }

            // Capacity filter
            if (capacityFilter === '1-30' && (res.capacity < 1 || res.capacity > 30)) return false;
            if (capacityFilter === '31-60' && (res.capacity < 31 || res.capacity > 60)) return false;
            if (capacityFilter === '61-100' && (res.capacity < 61 || res.capacity > 100)) return false;
            if (capacityFilter === '100+' && res.capacity < 101) return false;

            return true;
        });
    }, [resources, searchQuery, typeFilter, buildingFilter, capacityFilter]);

    // Booked slots for selected resource modal
    const resourceBookedSlots = useMemo(() => {
        if (!bookings || !selectedResource) return [];
        return bookings.filter(
            (b) => b.resourceId === selectedResource.id && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
        );
    }, [bookings, selectedResource]);

    const handleOpenBookingModal = (res: Resource) => {
        setSelectedResource(res);
        setStartsAt('');
        setEndsAt('');
        setPurpose('');
        setBookingError('');
    };

    const handleCloseBookingModal = () => {
        setSelectedResource(null);
        setStartsAt('');
        setEndsAt('');
        setPurpose('');
        setBookingError('');
    };

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingError('');

        if (!selectedResource) return;

        if (!startsAt || !endsAt) {
            setBookingError('Please choose a reservation date and time interval.');
            toast.error('Please choose a date and time slot.');
            return;
        }

        try {
            await createBooking.mutateAsync({
                resourceId: selectedResource.id,
                startsAt,
                endsAt,
                purpose: purpose.trim() || undefined,
            });

            toast.success(`Reserved ${selectedResource.name} successfully!`);
            handleCloseBookingModal();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to complete booking. Please try another slot.';
            setBookingError(errorMsg);
            toast.error(errorMsg);
        }
    };

    // Helper to get descriptive sentence
    const getResourceDescription = (type: string, name: string) => {
        const t = (type || '').toUpperCase();
        if (t.includes('LAB')) {
            return `Equipped with workstation terminals, modern networking fixtures, and developer tooling for coursework and research.`;
        }
        if (t.includes('AUDITORIUM') || t.includes('SEMINAR') || name.includes('Hall')) {
            return `Tiered seating hall equipped with integrated dual projection, professional audio system, and recording console.`;
        }
        if (t.includes('CLASS') || t.includes('LECTURE')) {
            return `Smart instructional classroom configured for dynamic lecture delivery with interactive whiteboard support.`;
        }
        if (t.includes('CONF') || t.includes('MEETING') || t.includes('STUDY')) {
            return `Quiet collaboration suite equipped with video conferencing monitors and digital presentation equipment.`;
        }
        return `High-utility campus space in ${name} optimized for collaborative study, faculty sessions, and academic events.`;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* 1. Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Find your next space.
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Explore active rooms, labs and facilities across Main Campus.
                </p>
            </div>

            {/* 2. Sticky Filters Bar */}
            <div className="sticky top-16 z-20 bg-slate-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md py-4 border-b border-slate-200 dark:border-slate-800/80 -mx-8 px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors duration-200">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search rooms, labs, or buildings..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Type Filter */}
                    <div className="relative flex items-center">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">All types</option>
                            {resourceTypes.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 pointer-events-none" />
                    </div>

                    {/* Building Filter */}
                    <div className="relative flex items-center">
                        <select
                            value={buildingFilter}
                            onChange={(e) => setBuildingFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">All buildings</option>
                            {buildings.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                        <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 pointer-events-none" />
                    </div>

                    {/* Capacity Filter */}
                    <div className="relative flex items-center">
                        <select
                            value={capacityFilter}
                            onChange={(e) => setCapacityFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Any capacity</option>
                            <option value="1-30">1 - 30 seats</option>
                            <option value="31-60">31 - 60 seats</option>
                            <option value="61-100">61 - 100 seats</option>
                            <option value="100+">100+ seats</option>
                        </select>
                        <SlidersHorizontal className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* 3. Resource Grid (3-column layout) */}
            {loadingResources ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="animate-pulse bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl h-80 p-4 flex flex-col justify-between"
                        >
                            <div className="h-36 bg-slate-200 dark:bg-slate-800/50 rounded-xl" />
                            <div className="space-y-2 py-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded w-1/2" />
                            </div>
                            <div className="h-10 bg-slate-200 dark:bg-slate-800/40 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="bg-white dark:bg-[#121212] border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No spaces match your filters</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Try resetting your search query or selecting "All types" to discover available facilities across campus.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setTypeFilter('ALL');
                            setBuildingFilter('ALL');
                            setCapacityFilter('ALL');
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res) => (
                        <div
                            key={res.id}
                            className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between group shadow-sm"
                        >
                            {/* Top Half: Unsplash Photography Area */}
                            <div className="h-40 bg-slate-900 relative overflow-hidden border-b border-slate-200 dark:border-slate-800/60 p-4 flex flex-col justify-between group">
                                <img
                                    src={getResourceImage(res.resourceType, res.name)}
                                    alt={res.name}
                                    className="object-cover w-full h-full absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                                {/* Badges Bar */}
                                <div className="flex items-center justify-between z-10 relative">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Available
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 dark:text-blue-400 border border-blue-500/30 backdrop-blur-sm uppercase tracking-wider">
                                        {res.resourceType}
                                    </span>
                                </div>

                                {/* Bottom Tag within Image */}
                                <div className="flex items-center gap-2 z-10 relative">
                                    {res.approvalRequired && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 backdrop-blur-sm">
                                            <ShieldAlert className="w-3 h-3" />
                                            Approval Required
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Half: Content & Action */}
                            <div className="p-5 flex flex-col justify-between flex-1">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                        {res.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                        <span>{res.buildingName || 'Academic Block 1'} • VIT Chennai</span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                                        {getResourceDescription(res.resourceType, res.name)}
                                    </p>
                                </div>

                                {/* Footer / Book Trigger */}
                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                        <span>{res.capacity} Seats</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleOpenBookingModal(res)}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-glow-blue transition-all flex items-center gap-1.5 group/btn"
                                    >
                                        <span>Book</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 4. Seamless Booking Modal Integration */}
            {selectedResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                        {selectedResource.resourceType}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedResource.buildingName || 'Academic Block 1'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                                    Reserve {selectedResource.name}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Select your reservation date and duration. Double-booking checks are enforced automatically.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseBookingModal}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Booking Error Alert */}
                        {bookingError && (
                            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl p-3 flex items-start gap-2">
                                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
                                <span>{bookingError}</span>
                            </div>
                        )}

                        {/* Modal Form */}
                        <form onSubmit={handleConfirmBooking} className="space-y-6">
                            {/* Date & Time Slot Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Select Date & Time Window
                                </label>
                                <TimeSlotSelector
                                    selectedStartsAt={startsAt}
                                    selectedEndsAt={endsAt}
                                    onChange={(newStart, newEnd) => {
                                        setStartsAt(newStart);
                                        setEndsAt(newEnd);
                                    }}
                                    bookedSlots={resourceBookedSlots}
                                    disabled={createBooking.isPending}
                                />
                            </div>

                            {/* Purpose Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Purpose of Reservation (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    placeholder="e.g. Lab Experiment, Seminar, Team Hackathon..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                    disabled={createBooking.isPending}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCloseBookingModal}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                                    disabled={createBooking.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createBooking.isPending || !startsAt || !endsAt}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {createBooking.isPending ? (
                                        <>
                                            <Calendar className="w-3.5 h-3.5 animate-spin" />
                                            <span>Confirming...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm Reservation</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;
