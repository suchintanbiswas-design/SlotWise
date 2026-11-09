package com.slotwise.auth.service;

import com.slotwise.auth.dto.AuthenticationResponse;
import com.slotwise.auth.dto.LoginRequest;
import com.slotwise.auth.dto.RegisterRequest;
import com.slotwise.common.security.JwtService;
import com.slotwise.common.security.SecurityUser;
import com.slotwise.user.entity.Role;
import com.slotwise.user.entity.User;
import com.slotwise.user.repository.RoleRepository;
import com.slotwise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("STUDENT");
                    return roleRepository.save(newRole);
                });

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAccountStatus("ACTIVE");
        user.setRoles(Set.of(studentRole));

        User savedUser = userRepository.save(user);
        SecurityUser securityUser = new SecurityUser(savedUser);

        String jwtToken = jwtService.generateToken(securityUser);
        Set<String> roleNames = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthenticationResponse(
                jwtToken,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                roleNames
        );
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        SecurityUser securityUser = new SecurityUser(user);
        String jwtToken = jwtService.generateToken(securityUser);

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthenticationResponse(
                jwtToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                roleNames
        );
    }
}

