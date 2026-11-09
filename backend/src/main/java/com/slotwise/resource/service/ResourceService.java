package com.slotwise.resource.service;

import com.slotwise.common.exception.ResourceNotFoundException;
import com.slotwise.resource.dto.ResourceDTO;
import com.slotwise.resource.entity.Resource;
import com.slotwise.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceDTO> getAllActiveResources() {
        return resourceRepository.findAll().stream()
                .filter(Resource::getActive)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return mapToDTO(resource);
    }

    private ResourceDTO mapToDTO(Resource resource) {
        String buildingName = resource.getBuilding() != null
                ? resource.getBuilding().getName()
                : (resource.getBuildingName() != null ? resource.getBuildingName() : "Main Campus");
        UUID buildingId = resource.getBuilding() != null
                ? resource.getBuilding().getId()
                : null;
        return new ResourceDTO(
                resource.getId(),
                resource.getName(),
                resource.getResourceType(),
                resource.getCapacity(),
                buildingId,
                buildingName,
                resource.getApprovalRequired()
        );
    }
}
