package com.slotwise.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.UUID;

public record BookingRequest(
    @NotNull(message = "Resource ID is required")
    UUID resourceId,

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    ZonedDateTime startsAt,

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    ZonedDateTime endsAt,

    String purpose
) {}

