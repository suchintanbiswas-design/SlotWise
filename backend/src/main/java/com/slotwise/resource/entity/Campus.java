package com.slotwise.resource.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "campuses")
@Getter
@Setter
@NoArgsConstructor
public class Campus {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String timezone;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}

