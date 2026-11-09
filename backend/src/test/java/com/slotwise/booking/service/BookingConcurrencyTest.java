package com.slotwise.booking.service;

import com.slotwise.booking.dto.BookingRequest;
import com.slotwise.common.exception.ResourceUnavailableException;
import com.slotwise.resource.entity.Building;
import com.slotwise.resource.entity.Campus;
import com.slotwise.resource.entity.Resource;
import com.slotwise.resource.repository.BuildingRepository;
import com.slotwise.resource.repository.CampusRepository;
import com.slotwise.resource.repository.ResourceRepository;
import com.slotwise.user.entity.User;
import com.slotwise.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.ZonedDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public class BookingConcurrencyTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("slotwise_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampusRepository campusRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    private User testUser;
    private Resource testResource;

    @BeforeEach
    void setUp() {
        // Seed Campus
        Campus campus = new Campus();
        campus.setName("Test Campus");
        campus.setTimezone("UTC");
        campus = campusRepository.saveAndFlush(campus);

        // Seed Building
        Building building = new Building();
        building.setName("Test Building");
        building.setCampus(campus);
        building = buildingRepository.saveAndFlush(building);

        // Seed Resource
        Resource resource = new Resource();
        resource.setName("Test Hall");
        resource.setResourceType("HALL");
        resource.setCapacity(100);
        resource.setBuilding(building);
        resource.setApprovalRequired(false);
        this.testResource = resourceRepository.saveAndFlush(resource);

        // Seed User
        User user = new User();
        user.setEmail("test@test.com");
        user.setFullName("Test User");
        user.setPasswordHash("hashed_password");
        user.setCampus(campus);
        this.testUser = userRepository.saveAndFlush(user);
    }

    @Test
    void testConcurrentBookings_PreventsDoubleBooking() throws InterruptedException {
        int numberOfThreads = 20;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        ZonedDateTime startsAt = ZonedDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime endsAt = startsAt.plusHours(1);

        BookingRequest request = new BookingRequest(
                testResource.getId(),
                startsAt,
                endsAt,
                "Concurrent Test Meeting"
        );

        for (int i = 0; i < numberOfThreads; i++) {
            executorService.submit(() -> {
                try {
                    latch.await(); // Wait for the green light so all threads execute simultaneously
                    bookingService.createBooking(request, testUser.getEmail());
                    successCount.incrementAndGet();
                } catch (ResourceUnavailableException e) {
                    // This is the expected exception for the 19 failed attempts
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    System.err.println("Unexpected exception: " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown(); // Release all threads at the exact same time
        doneLatch.await(); // Wait for all threads to finish processing

        executorService.shutdown();

        // ASSERTIONS: This proves our GiST constraint works flawlessly
        assertEquals(1, successCount.get(), "Exactly one booking should succeed.");
        assertEquals(19, conflictCount.get(), "Exactly nineteen bookings should be rejected due to conflict.");
    }
}

