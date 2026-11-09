import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to sign in. Please verify your email and password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0a] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-300">
            {/* Left Panel: Brand / Marketing Showcase */}
            <div className="w-full lg:w-1/2 bg-[#121212] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#121212] to-[#121212] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative">
                {/* Brand Header */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-blue">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl text-white tracking-tight">SlotWise</span>
                        <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider -mt-0.5">
                            Campus OS
                        </span>
                    </div>
                </div>

                {/* Main Hero & Value Proposition */}
                <div className="my-12 lg:my-0 max-w-xl">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Find your next space.
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
                        One account connects you to the rooms, labs, and facilities that help ideas move across the VIT Chennai campus.
                    </p>

                    {/* Features List */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-white">Search across campus</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Instant real-time availability for auditoriums, seminar halls, and smart labs.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-white">Track every reservation</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Seamlessly view confirmed schedules and administrative approval status in one place.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-white">Stay in the loop</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Automated notifications, calendar sync, and guaranteed double-booking prevention.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Muted Footer */}
                <div className="text-xs text-slate-500 font-medium">
                    VIT Chennai Campus Resource Management Platform
                </div>
            </div>

            {/* Right Panel: Centered Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-[#0a0a0a]">
                <div className="max-w-md w-full space-y-8">
                    {/* Form Header */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Sign in to SlotWise
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Enter your registered campus credentials to access your dashboard.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Sign-in Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Campus Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@vit.ac.in"
                                className="w-full px-4 py-3 rounded-xl bg-transparent border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-transparent border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm group"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch to Register */}
                    <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800/80">
                        <span>Don't have an account? </span>
                        <Link
                            to="/register"
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
