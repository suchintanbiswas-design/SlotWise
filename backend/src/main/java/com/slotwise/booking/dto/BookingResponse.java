package com.slotwise.booking.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public record BookingResponse(
    UUID id,
    UUID resourceId,
    String resourceName,
    UUID userId,
    String userFullName,
    ZonedDateTime startsAt,
    ZonedDateTime endsAt,
    String status,
    String purpose
) {}

