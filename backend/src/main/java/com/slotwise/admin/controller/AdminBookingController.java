package com.slotwise.admin.controller;

import com.slotwise.booking.dto.BookingResponse;
import com.slotwise.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<List<BookingResponse>> getPendingBookings() {
        return ResponseEntity.ok(bookingService.getPendingBookings());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable UUID id,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.approveBooking(id, authentication.getName()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable UUID id,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, authentication.getName()));
    }
}

