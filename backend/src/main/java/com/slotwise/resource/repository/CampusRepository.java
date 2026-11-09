package com.slotwise.resource.repository;

import com.slotwise.resource.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CampusRepository extends JpaRepository<Campus, UUID> {
}

