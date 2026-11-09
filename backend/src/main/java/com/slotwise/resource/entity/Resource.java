package com.slotwise.resource.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = true)
    private Building building;

    @Column(name = "building_name")
    private String buildingName;

    @Column(nullable = false)
    private String name;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "approval_required", nullable = false)
    private Boolean approvalRequired = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "min_duration_minutes", nullable = false)
    private Integer minDurationMinutes = 30;

    @Column(name = "max_duration_minutes", nullable = false)
    private Integer maxDurationMinutes = 180;

    @Column(name = "booking_increment_minutes", nullable = false)
    private Integer bookingIncrementMinutes = 15;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
