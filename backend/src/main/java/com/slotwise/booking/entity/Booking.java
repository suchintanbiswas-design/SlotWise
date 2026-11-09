package com.slotwise.booking.entity;

import com.slotwise.resource.entity.Resource;
import com.slotwise.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(name = "starts_at", nullable = false)
    private ZonedDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private ZonedDateTime endsAt;

    @Column(nullable = false)
    private String status = "REQUESTED";

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "decided_at")
    private ZonedDateTime decidedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}

