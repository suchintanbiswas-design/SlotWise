import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    Compass,
    CalendarCheck2,
    Shield,
    Bell,
    LogOut,
    Layers,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import { cn } from '../utils/cn';

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();

    // Map current path to section title for breadcrumbs
    const getBreadcrumbTitle = (pathname: string) => {
        if (pathname.startsWith('/dashboard')) return 'Overview';
        if (pathname.startsWith('/resources')) return 'Find Resources';
        if (pathname.startsWith('/bookings')) return 'My Bookings';
        if (pathname.startsWith('/admin')) return 'Admin Approvals';
        return 'Workspace';
    };

    const currentTitle = getBreadcrumbTitle(location.pathname);

    const navItems = [
        {
            to: '/dashboard',
            label: 'Overview',
            icon: LayoutDashboard,
        },
        {
            to: '/resources',
            label: 'Find resources',
            icon: Compass,
        },
        {
            to: '/bookings',
            label: 'My bookings',
            icon: CalendarCheck2,
        },
    ];

    const hasAdminAccess = user?.roles.includes('ADMIN') || user?.roles.includes('FACULTY');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
            {/* Left Sidebar (fixed, w-64) */}
            <aside className="w-64 bg-white dark:bg-[#121212] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between fixed inset-y-0 left-0 z-30 select-none transition-colors duration-200">
                {/* Top: Logo & Main Navigation */}
                <div className="flex flex-col">
                    {/* Brand Header */}
                    <div className="h-16 px-6 flex items-center border-b border-slate-200 dark:border-slate-800/60">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-blue">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                                    SlotWise
                                </span>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider -mt-0.5">
                                    Campus OS
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="p-4 space-y-1.5">
                        <div className="px-3 pb-2 pt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Navigation
                        </div>
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group border-l-2',
                                            isActive
                                                ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white border-blue-500 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border-transparent'
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <IconComponent
                                                className={cn(
                                                    'w-4 h-4 mr-3 transition-colors',
                                                    isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                                                )}
                                            />
                                            <span>{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}

                        {/* Admin / Faculty Section */}
                        {hasAdminAccess && (
                            <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800/60">
                                <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    Administration
                                </div>
                                <NavLink
                                    to="/admin/dashboard"
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group border-l-2',
                                            isActive
                                                ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white border-blue-500 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border-transparent'
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Shield
                                                className={cn(
                                                    'w-4 h-4 mr-3 transition-colors',
                                                    isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                                                )}
                                            />
                                            <span>Approvals</span>
                                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                Admin
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Bottom: User Profile & Logout */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0f0f0f]">
                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            {/* User Avatar */}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user?.fullName || 'User'}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user?.roles?.join(', ') || 'STUDENT'}
                                </span>
                            </div>
                        </div>

                        {/* Logout Icon Button */}
                        <button
                            type="button"
                            onClick={logout}
                            title="Sign out"
                            className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors ml-1 shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area: Offset by sidebar width (pl-64) */}
            <div className="pl-64 flex flex-col flex-1 min-h-screen">
                {/* Top Header Bar */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 transition-colors duration-200">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-xs tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400">
                        <span className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer">
                            MAIN CAMPUS
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400 dark:text-slate-600" />
                        <span className="text-slate-800 dark:text-slate-200">{currentTitle}</span>
                    </div>

                    {/* Right Header Utilities */}
                    <div className="flex items-center space-x-3">
                        {/* Light / Dark Mode Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors focus:outline-none"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? (
                                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900 transition-colors" />
                            )}
                        </button>

                        {/* Notification Bell */}
                        <button
                            type="button"
                            className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors focus:outline-none"
                            title="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2 ring-2 ring-white dark:ring-[#0a0a0a]" />
                        </button>
                    </div>
                </header>

                {/* Primary Content Viewport */}
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
