package com.slotwise.resource.repository;

import com.slotwise.resource.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByBuildingIdAndActiveTrue(UUID buildingId);
}

