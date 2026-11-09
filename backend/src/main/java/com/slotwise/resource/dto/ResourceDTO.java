package com.slotwise.resource.dto;

import java.util.UUID;

public record ResourceDTO(
    UUID id,
    String name,
    String resourceType,
    Integer capacity,
    UUID buildingId,
    String buildingName,
    Boolean approvalRequired
) {}

