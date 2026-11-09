package com.slotwise.booking.service;

import com.slotwise.booking.dto.BookingRequest;
import com.slotwise.booking.dto.BookingResponse;
import com.slotwise.booking.entity.Booking;
import com.slotwise.booking.repository.BookingRepository;
import com.slotwise.common.exception.InvalidBookingException;
import com.slotwise.common.exception.ResourceNotFoundException;
import com.slotwise.common.exception.ResourceUnavailableException;
import com.slotwise.resource.entity.Resource;
import com.slotwise.resource.repository.ResourceRepository;
import com.slotwise.user.entity.User;
import com.slotwise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        if (!request.startsAt().isBefore(request.endsAt())) {
            throw new InvalidBookingException("Start time must be strictly before end time.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        Resource resource = resourceRepository.findByIdForUpdate(request.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.resourceId()));

        if (!resource.getActive()) {
            throw new InvalidBookingException("This resource is currently inactive and cannot be booked.");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setStartsAt(request.startsAt());
        booking.setEndsAt(request.endsAt());
        booking.setPurpose(request.purpose());
        
        // Auto-confirm if no approval is required, otherwise set to REQUESTED
        booking.setStatus(resource.getApprovalRequired() ? "REQUESTED" : "CONFIRMED");

        try {
            // MUST use saveAndFlush to force the immediate execution of the SQL INSERT.
            // If we only use save(), Hibernate delays execution until commit, bypassing this try-catch block.
            Booking savedBooking = bookingRepository.saveAndFlush(booking);
            return mapToResponse(savedBooking);
        } catch (DataIntegrityViolationException | ConcurrencyFailureException e) {
            // Handles both the exclusion-constraint violation and a deadlock/lock failure under heavy concurrency
            throw new ResourceUnavailableException("The resource is already booked for the selected time slot.");
        }
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        
        return bookingRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // Ownership Check: Ensure the authenticated user owns this booking
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new InvalidBookingException("You do not have permission to modify this booking.");
        }

        // State Machine Check: Only REQUESTED or CONFIRMED bookings can be cancelled
        if ("CANCELLED".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
            throw new InvalidBookingException("This booking cannot be cancelled in its current state.");
        }

        booking.setStatus("CANCELLED");
        // No need for saveAndFlush here since a status update to CANCELLED 
        // will safely drop it from the PostgreSQL exclusion constraint view.
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getPendingBookings() {
        return bookingRepository.findByStatusOrderByStartsAtAsc("REQUESTED").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse approveBooking(UUID bookingId, String adminEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin user not found."));

        if (!"REQUESTED".equals(booking.getStatus())) {
            throw new InvalidBookingException("Only REQUESTED bookings can be approved.");
        }

        booking.setStatus("CONFIRMED");
        booking.setApprovedBy(admin);
        booking.setDecidedAt(java.time.ZonedDateTime.now());
        
        // No saveAndFlush needed for double-booking here; REQUESTED already holds the GiST slot.
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse rejectBooking(UUID bookingId, String adminEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin user not found."));

        if (!"REQUESTED".equals(booking.getStatus())) {
            throw new InvalidBookingException("Only REQUESTED bookings can be rejected.");
        }

        booking.setStatus("REJECTED");
        booking.setApprovedBy(admin);
        booking.setDecidedAt(java.time.ZonedDateTime.now());
        
        // Rejecting releases the slot, allowing others to book it.
        return mapToResponse(bookingRepository.save(booking));
    }

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getUser().getId(),
                booking.getUser().getFullName(),
                booking.getStartsAt(),
                booking.getEndsAt(),
                booking.getStatus(),
                booking.getPurpose()
        );
    }
}
