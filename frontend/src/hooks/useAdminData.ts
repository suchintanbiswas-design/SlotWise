import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import type { BookingResponse } from '../types/booking';

export const usePendingBookings = () => {
    return useQuery({
        queryKey: ['pendingBookings'],
        queryFn: async () => {
            const { data } = await api.get<BookingResponse[]>('/admin/bookings/pending');
            return data;
        }
    });
};

export const useApproveBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const { data } = await api.post<BookingResponse>(`/admin/bookings/${bookingId}/approve`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingBookings'] });
        }
    });
};

export const useRejectBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const { data } = await api.post<BookingResponse>(`/admin/bookings/${bookingId}/reject`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingBookings'] });
        }
    });
};

