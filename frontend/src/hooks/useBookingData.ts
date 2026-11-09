import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import type { Resource, BookingResponse, BookingRequest } from '../types/booking';

export const useResources = () => {
    return useQuery({
        queryKey: ['resources'],
        queryFn: async () => {
            const { data } = await api.get<Resource[]>('/resources');
            return data;
        }
    });
};

export const useMyBookings = () => {
    return useQuery({
        queryKey: ['myBookings'],
        queryFn: async () => {
            const { data } = await api.get<BookingResponse[]>('/bookings/me');
            return data;
        }
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newBooking: BookingRequest) => {
            const { data } = await api.post<BookingResponse>('/bookings', newBooking);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        }
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            const { data } = await api.post<BookingResponse>(`/bookings/${bookingId}/cancel`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        }
    });
};

