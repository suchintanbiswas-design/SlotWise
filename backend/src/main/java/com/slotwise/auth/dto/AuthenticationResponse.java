package com.slotwise.auth.dto;

import java.util.Set;
import java.util.UUID;

public record AuthenticationResponse(
    String token,
    UUID id,
    String email,
    String fullName,
    Set<String> roles
) {}

