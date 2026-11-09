import React from 'react';
import { Link } from 'react-router-dom';
import { usePendingBookings, useApproveBooking, useRejectBooking } from '../hooks/useAdminData';

const AdminDashboard: React.FC = () => {
    const { data: pendingBookings, isLoading } = usePendingBookings();
    const approveMutation = useApproveBooking();
    const rejectMutation = useRejectBooking();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Admin Approvals</h1>
                        <p className="text-gray-500">Manage pending resource requests</p>
                    </div>
                    <Link to="/dashboard" className="text-blue-600 hover:underline">
                        Back to My Dashboard
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    {isLoading ? (
                        <p>Loading requests...</p>
                    ) : pendingBookings?.length === 0 ? (
                        <p className="text-gray-500">No pending requests at this time.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingBookings?.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.resourceName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.userFullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.startsAt).toLocaleString()} <br/> 
                                                to {new Date(booking.endsAt).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.purpose || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => approveMutation.mutate(booking.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                    className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => rejectMutation.mutate(booking.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

