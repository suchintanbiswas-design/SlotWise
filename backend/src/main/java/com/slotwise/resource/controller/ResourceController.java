package com.slotwise.resource.controller;

import com.slotwise.resource.dto.ResourceDTO;
import com.slotwise.resource.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public List<ResourceDTO> getAllResources() {
        return resourceService.getAllActiveResources();
    }

    @GetMapping("/{id}")
    public ResourceDTO getResourceById(@PathVariable UUID id) {
        return resourceService.getResourceById(id);
    }
}

